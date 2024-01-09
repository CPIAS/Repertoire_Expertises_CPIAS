# Plateforme de recommandation et de maillage des expertises en IA et Santé de la CPIAS


![Demo Query](https://github.com/CPIAS/Research_Engine_Healthcare_AI/blob/main/demo-1.gif?raw=true)


## Description


Cet outil représente une solution innovante pour identifier de potentiels collaborateurs, soit des experts dans le domaine de l'IA appliquée à la santé ou des professionnels de la santé. Il offre un moteur de recherche avancé permettant de découvrir les membres de la CPIAS en se basant sur leurs champs d’expertises en IA et/ou en santé.


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


Pour plus d'information sur le déploiement sur une instance EC2 en AWS voir ce tutoriel  [Deploy a NodeJS React app to AWS EC2](https://www.youtube.com/watch?v=rE8mJ1OYjmM)


La documentation complète est dans le [guide du développeur](https://github.com/CPIAS/Research_Engine_Healthcare_AI/blob/main/Guide_d%C3%A9veloppeur.pdf)


## Installation Backend


### Compilation et déploiement


1. Cloner le répertoire Git de l’application dans l’instance EC2.
`git clone https://adresse_du_répertoire_du_projet.git`
2. Aller dans le répertoire Backend.
3. Lancer l’installation du serveur avec la commande suivante :
`sudo ./setup.sh`
4. Redémarrer l’instance.
5. Accéder à serveur en ouvrant le navigateur et en accédant à l’URL correspondant à l’adresse
publique IPv4 de l’instance EC2 créée.


La documentation complète pour le Backend est dans le [guide du développeur](https://github.com/CPIAS/Research_Engine_Healthcare_AI/blob/main/Guide_d%C3%A9veloppeur.pdf)


## Équipe de Développement


- [Antoine Déry](mailto:antoine-1.dery@polymtl.ca)
- [Adam Halim](mailto:adam.halim@polymtl.ca)
- [Ahmed Sabsabi](mailto:ahmed.sabsabi@polymtl.ca)
- [Hichem Lamraoui](mailto:hichem.lamraoui@polymtl.ca)
- [Augustin Lompo](mailto:diassibo-kani-fares.lompo@polymtl.ca)


## Équipe de Supervision 
- [Pascale Beliveau ](mailto:pascale.beliveau.ca@gmail.com)
- [Mariem Abide ](mailto:abid.mariem@gmail.com)
- [Kahina Bensaadi ](mailto:kahina.bensaadi@gmail.com)
- [Lilia Brahimi ](mailto:lilia.brahimi97@gmail.com)
- [Amal Khabou ](mailto:a.khabou@gmail.com)
- [Yassine Benhajali ](mailto:yassine.benhajali@gmail.com)
## Collaborateurs 
- [Natalie Mayerhofer](mailto:natalie.mayerhofer.chum@gmail.com)
- [Antony Mak](mailto:anthony.mak.chum@ssss.gouv.qc.ca)
## Bonnes pratiques 
Il est de la responsabilité des entités qui reproduisent le code pour développer leurs propres plateformes de s’assurer que cela respecte les bonnes pratiques en matière de collecte, conservation et droit d’exploitation des données, nous dégageons toute responsabilité d’un usage qui contrevient aux lois en vigueur. Nous recommandons sans s’y limiter les bonne pratiques suivantes: 
- Il est important de s’assurer d’obtenir le consentement éclairé des individus qui font partie du répertoire d’expertise, 
- Il est important de rester transparent envers les individus sur les données collectées les usages qui ont sont faits, 
- Avant de croiser les données avec d’autres sources de données publiques, il est important d’en informer les individus faisant partie de la plateforme.
## Licence
La plateforme de recommandation et de maillage des expertises en IA et Santé de la CPIAS est diffusé sous la licence publique générale GNU v3.0 ou une version ultérieure. Voir le fichier `LICENSE` pour plus de détails.
