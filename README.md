# Citizen Mission

## Démo publique sans installation

[Ouvrir la démo FR](https://gbesse.github.io/citizen-mission/fr/space/commons/citizen/?lang=fr) · [EN](https://gbesse.github.io/citizen-mission/en/space/commons/citizen/?lang=en) · [ES](https://gbesse.github.io/citizen-mission/es/space/commons/citizen/?lang=es).

L’édition publique rejoue les preuves de calcul archivées ; elle conserve le défi quotidien, les réglages partageables et les exports JSON/PNG. Elle n’exécute aucun moteur et n’expose aucune API locale. Le défi reste choisi dans un catalogue figé ; aucun classement mondial ni audience externe n’est présumé. La publication GitHub Pages est reconstruite et testée sur chaque changement de `main`.

Pour héberger sous un chemin, utiliser `SITE_BASE_PATH=/citizen-mission/ npm run build`. Sans cette variable, le site reste utilisable à la racine. Les trois langues, liens, ressources et preuves restent dans le même préfixe. `manifest.json` enregistre `basePath`.

[![CI](https://github.com/gbesse/citizen-mission/actions/workflows/ci.yml/badge.svg)](https://github.com/gbesse/citizen-mission/actions) · [![MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE) · FR / EN / ES

Français · [English](README.en.md) · [Español](README.es.md)

Retrouver Voyager dans une observation radio réelle.

Lire l’observation publique Voyager 1/GBT avec blimpy, chercher sa dérive Doppler avec turboSETI sur CPU et explorer spectrogramme, porteuse et provenance.

![Citizen Mission](docs/citizen-mission-fr.png)

## Essayer en une minute

La démo utilise des calculs réellement exécutés et archivés, fournis dans ce dépôt autonome. Node.js 22+ suffit ; aucun compte, clé API, dépôt parent ou service externe n’est nécessaire pour la relecture.

```sh
git clone https://github.com/gbesse/citizen-mission.git
cd citizen-mission
node bin/cli.js demo --locale=fr
npm start
```

http://127.0.0.1:4325/?lang=fr

Interface locale FR/EN/ES, défi quotidien UTC dans un catalogue figé, prédiction scorée, URL de paramètres reproductible, preuve JSON et carte PNG. L’historique est local ; aucun classement mondial ni trafic inventé.

## Exécuter les vrais moteurs

Python 3.11–3.13 et curl. Aucun GPU, Java ni ION requis.

blimpy 2.1.4 · turboSETI 2.3.2 · CPU

```sh
npm run setup:engines
npm run test:engines
node bin/cli.js run --locale=fr
```

Le bouton « Exécuter » et la commande `run` lancent les moteurs installés ; « Rejouer » ne relance aucun moteur. Aucun résultat de secours synthétique. L’installation télécharge seulement les dépendances de ce projet, dans `.local/space-runtime`, ignoré par Git. `SPACE_RUNTIME` peut désigner un runtime déjà installé ; `SPACE_LOCALE` choisit la langue du script.

## Méthode, données et limites

Observation radio publique de Voyager 1 au GBT, lue par blimpy et analysée par turboSETI sur CPU. Le signal vient d’une sonde humaine connue. Aucune observation OFF n’est disponible ici : ces détections ne démontrent pas un signal extraterrestre.

Les versions, paramètres, empreintes et notices sont inclus. Les grands fichiers H5/SPK et les binaires ne sont pas redistribués ; leurs sources et SHA-256 sont épinglés. Les dépendances et données externes conservent leurs conditions respectives.

Projet logiciel indépendant sous licence MIT, sans affiliation NASA/JPL, ESA ou fournisseurs cités. Aucun logiciel ni API de machine de fabrication requis. Code extrait de Frontier Lab, adapté à un dépôt autonome ; provenance dans `upstream.json`. Les données utilisateur ne sont pas traduites. Les exports CLI n’écrasent pas les fichiers.

## Vérifier et contribuer

```sh
npm ci
npm test
npx playwright install chromium
npm run test:browser
npm run format:check
```

`npm run build` exporte `output/site` pour un hébergement statique à la racine d’un domaine. Cette édition rejoue les cas publiés, sans moteur ni API locale exposée.

[Mission Benchmark Commons](https://github.com/gbesse/mission-benchmark-commons) · [Contact Market](https://github.com/gbesse/contact-market) · [Citizen Mission](https://github.com/gbesse/citizen-mission)
