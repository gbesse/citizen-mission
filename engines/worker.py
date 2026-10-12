import contextlib

import hashlib

import importlib.metadata

import io

import json

import math

import os

from pathlib import Path

import subprocess

import sys

import tempfile

def sha(path):
    with open(path, "rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()

def verified(runtime, name):
    manifest = json.loads((Path(__file__).parent / "datasets.json").read_text())
    data = next(x for x in manifest["datasets"] if x["id"] == name)
    path = runtime / data["file"]
    if path.stat().st_size != data["bytes"] or sha(path) != data["sha256"]:
        raise ValueError("DATASET_INTEGRITY")
    return path, data

def version(name):
    return importlib.metadata.version(name)

def citizen(runtime, config):
    import numpy as np
    from blimpy import Waterfall
    from turbo_seti.find_doppler.find_doppler import FindDoppler
    if config["snr"] not in [10, 25, 50] or config["maxDriftHzSec"] not in [1, 4]: raise ValueError("CONFIG")
    path, source = verified(runtime, "voyager-1")
    # Restricted public observation band: same measured samples, no injected signal or invented OFF.
    wf = Waterfall(str(path), f_start=8419.24, f_stop=8419.35, max_load=.1)
    data = np.asarray(wf.data[:, 0, :], dtype=np.float64)
    with tempfile.TemporaryDirectory(prefix="citizen-", dir=runtime) as folder:
        excerpt = Path(folder) / "voyager-band.h5"
        wf.write_to_hdf5(str(excerpt))
        engine = FindDoppler(str(excerpt), max_drift=config["maxDriftHzSec"], snr=config["snr"], out_dir=folder, n_coarse_chan=1, gpu_backend=False, log_level_int=40)
        engine.search()
        hits = []
        for output in Path(folder).glob("*.dat"):
            for line in output.read_text().splitlines():
                if not line.strip() or line.startswith("#"): continue
                fields = line.split()
                if len(fields) >= 8:
                    hits.append({"id": int(fields[0]), "driftHzSec": float(fields[1]), "snr": float(fields[2]), "frequencyMHz": float(fields[3])})
        dat_hash = sha(next(Path(folder).glob("*.dat")))
    maxima = data.argmax(axis=1)
    axis = np.asarray(wf.container.populate_freqs(), dtype=np.float64)
    peak_mhz = axis[maxima]
    time_axis = np.arange(data.shape[0]) * float(wf.header["tsamp"])
    peak_drift = float(np.polyfit(time_axis, peak_mhz * 1e6, 1)[0])
    target_bins = 128
    parts = np.array_split(np.arange(data.shape[1]), target_bins)
    reduced = np.column_stack([data[:, bins].max(axis=1) for bins in parts])
    background = float(np.median(data)); view = (10 * np.log10(np.maximum(reduced, 1e-15) / max(background, 1e-15))).tolist()
    carrier = [hit for hit in hits if 8419.295 <= hit["frequencyMHz"] <= 8419.300]
    return {"engines": [{"name": "blimpy", "version": version("blimpy")}, {"name": "turboSETI", "version": version("turbo-seti"), "backend": "CPU"}], "sources": [source], "target": str(wf.header["source_name"]), "mjdStart": float(wf.header["tstart"]), "sampleSeconds": float(wf.header["tsamp"]), "channelHz": abs(float(wf.header["foff"]) * 1e6), "observedShape": list(data.shape), "bandMHz": [float(axis.min()), float(axis.max())], "hits": hits, "carrierHits": len(carrier), "measuredPeakDriftHzSec": peak_drift, "waterfallDb": view, "frequencyBinsMHz": [float(np.mean(axis[bins])) for bins in parts], "peakTrack": [{"timeSec": float(t), "frequencyMHz": float(f)} for t, f in zip(time_axis, peak_mhz)], "searchDatSha256": dat_hash, "classification": "known-human-spacecraft", "offObservationAvailable": False}

def main():
    runtime = Path(sys.argv[1]).resolve()
    kind = sys.argv[2]
    config = json.loads(sys.stdin.read(4096))
    with contextlib.redirect_stdout(io.StringIO()):
        result = {"citizen": citizen}[kind](runtime, config)
    print(json.dumps(result, allow_nan=False, separators=(",", ":")))

if __name__ == "__main__":
    main()
