# Plateforme de recommandation et de maillage des expertises en IA et Santé

![Demo Query](https://github.com/CPIAS/Research_Engine_Healthcare_AI/blob/main/demo-1.gif?raw=true)

## Description

Cet outil représente une solution innovante pour identifier et collaborer avec des experts dans le domaine de l'IA appliquée à la santé. Il offre un moteur de recherche avancé permettant de découvrir les membres de la CPIAS en se basant sur leurs compétences spécifiques en IA et en santé.

## Installation Frontend

### Lancement de l'application en mode développement

#### Prérequis

Avant de procéder au lancement de l'application, il est nécessaire de s'assurer que les éléments suivants sont correctement installés ou configurés :

- Node.js (version 16.0 et plus)
- Node Package Manager (npm), qui est généralement inclus avec l’installation de Node.js.
- Fichier .env avec les variables présentées à la section 2.3.

#### Installation

1. Installer les dépendances du projet en exécutant la commande suivante dans un terminal
ouvert dans le répertoire Frontend :

    ```bash
    npm ci
    ```

2. Lancer la compilation de l’application en exécutant la commande suivante :

    ```bash
    npm start
    ```

3. Accéder à l’application en ouvrant le navigateur et en accédant à l’URL

    <http://localhost:3000>

4. Lors du développement, exécuter la commande suivante pour rouler l’analyseur de code statique ESlint pour détecter et régler les défauts dans la qualité du code.

    ```bash
    npm run lint //Détecter les défauts
    npm run lint:fix //Régler les défauts
    ```

### Lancement de l'application en mode déploiement

Les étapes de déploiement ci-dessous permettent de déployer l’interface utilisateur sur une
instance EC2 d’Amazon Web Services.

#### Prérequis

- Instance EC2 avec un minimum de 4 Go de mémoire vive
- Nginx installé sur l’instance EC2

#### Compilation et déploiement

1. Cloner le répertoire Git de l’application dans l’instance EC2.
2. Aller dans le répertoire `./Frontend`
3. Lancer la construction de l’application avec la commande suivante :

    ```bash
    npm run build
    ```

4. Copier le contenu du répertoire ./build vers le répertoire `./var/www/cpias`
5. Lancer Nginx avec la commande suivante :

    ```bash
    sudo systemctl restart build
    ```

Pour plus d'information sur le déploiement en AWS sur EC2 voir ce tutoriel  [Deploy a NodeJS React app to AWS EC2](https://www.youtube.com/watch?v=rE8mJ1OYjmM)

La documentation complète ce trouve [ici]()

Consultez le guide du développeur pour les instructions et la configuration du projet.

## Développeurs (Équipe Polytechnique)

- [Antoine Déry](mailto:antoine-1.dery@polymtl.ca)
- [Adam Halim](mailto:adam.halim@polymtl.ca)
- [Ahmed Sabsabi](mailto:ahmed.sabsabi@polymtl.ca)
- [Hichem Lamraoui](mailto:hichem.lamraoui@polymtl.ca)
- [Augustin Lompo](mailto:diassibo-kani-fares.lompo@polymtl.ca)
