"use strict";

// Variables globales pour une partie
let partie = {
    noTentativeCourante: 1,
    solution: [],
    options: {
        MAX_TENTATIVES: 0,
        NB_CHIFFRES_COMBINAISON: 0,
        MAX_CHIFFRES: 0,
        INDICES_POSITIONNELS: false
    },
    derniereCaseCliquee: null
};

window.onload = function () {
    document.getElementById("btnGo").addEventListener("click", debutJeu, false);
    document.getElementById("btnValider").addEventListener("click", traiterBoutonValider, false);
    let lesCases = document.getElementsByClassName("case");
    for (let uneCase of lesCases) {
        uneCase.addEventListener("click", traiterClicCase, false);
    }
}

function debutJeu() {
    // On initialise les options du jeu
    partie.options = {
        MAX_TENTATIVES: 5,
        NB_CHIFFRES_COMBINAISON: 6,
        MAX_CHIFFRES: 9,
        INDICES_POSITIONNELS: false
    };
    genererBarreSelectionChiffres(partie.options.MAX_CHIFFRES);
    partie.solution = genererCombinaisonMystere(partie.options.NB_CHIFFRES_COMBINAISON, partie.options.MAX_CHIFFRES);
    // Pour tester, on peut "hardcoder" la combinaison secrète.
    // partie.solution = [2, 3, 9, 1, 3, 0];

    partie.noTentativeCourante = 1;
    console.log(partie.solution);
    document.getElementById("t1_c1").focus();
}

function genererCombinaisonMystere(nbChiffres, chiffreMax) {
    let combinaison = [];
    if (nbChiffres >= 1 && nbChiffres <= 9
        && chiffreMax >= 0 && chiffreMax <= 9) {
        for (let i = 1; i <= nbChiffres; i++) {
            combinaison.push(Math.trunc((chiffreMax + 1) * Math.random()).toString());
        }
    }
    return combinaison;
}

function genererBarreSelectionChiffres(chiffreMax) {
    let contenuDiv = "";
    for (let i = 0; i <= chiffreMax; i++) {
        contenuDiv += `<div class='unChiffreDeLaBarre'>${i}</div>`;
    }
    document.getElementById("barreSelectionChiffres").innerHTML = contenuDiv;
    document.getElementById("barreSelectionChiffres").addEventListener(
        "mouseleave",
        function (ev) {
            ev.currentTarget.style.display = "none";
        },
        false
    );
    let lesChoixdeChiffres = document.getElementsByClassName("unChiffreDeLaBarre");
    for (let unChoix of lesChoixdeChiffres) {
        unChoix.addEventListener(
            "click",
            function (ev) {
                chiffreSelectionne(ev);
            },
            false
        );
    }
}

/*
    Suite au clic d'un chiffre dams la barre de sélection, on l'inscrit dans la case initiale qui avait
    été cliquée pour afficher la barre de sélection.
*/
function chiffreSelectionne(ev) {
    ev.target.parentElement.style.display = "none";
    partie.derniereCaseCliquee.value = ev.target.innerHTML;
}

function traiterBoutonValider() {
    let tentative = document.getElementById("t" + partie.noTentativeCourante);
    let lesCases = tentative.getElementsByClassName("case");
    let tentativeAValider = [];
    for (let uneCase of lesCases) {
        let chiffre = uneCase.value;
        if (uneCase.value.trim() !== "")
            tentativeAValider.push(chiffre.charAt(0));
        else {
            document.getElementById("t" + partie.noTentativeCourante + "_c1").focus();
            return;
        }
    }
    let indices = validerTentative(tentativeAValider, partie.solution, partie.options.INDICES_POSITIONNELS);
    console.log("INDICES = ", indices);
    
    let nbBienPlaces = 0;
    let nbMalPlaces = 0;
    if (indices.includes("*"))
        nbBienPlaces = indices.join("").lastIndexOf("*") - indices.join("").indexOf("*") + 1;
    if (indices.includes("?"))
        nbMalPlaces = indices.join("").lastIndexOf("?") - indices.join("").indexOf("?") + 1;
    document.getElementById("t" + partie.noTentativeCourante + "_indiceBienPlace").innerHTML = nbBienPlaces.toString();
    document.getElementById("t" + partie.noTentativeCourante + "_indiceMalPlace").innerHTML = nbMalPlaces.toString();

    partie.noTentativeCourante++;
    document.getElementById("t" + partie.noTentativeCourante + "_c1").focus();
}

/*
    Fonction qui évalue le contenu d'une tentative (tableau de N chiffres) vs la combinaison secrète (autre tableau
    de N chiffres), pour déterminer les indices à fournir pour cette combinaison proposée.

    Le dernier paramètre (un booléen) indique le type d'indices qui sera retourné. Pour les indices positionnels,
    on retourne un tableau de N caractères.
        - * signifie que ce chiffre est bien placé
        - ? signifie que ce chiffre est bon, mais pas à la bonne position
        - _ signifie que ce chiffre n'est pas bon

    Pour les indices non-positionnel, on retourne simplement un tableau trié (* en premier et ? en second), et où
    les _ ont été retirés du tableau.
*/
function validerTentative(tentative, solution, positionnel) {
    let indices = [];
    // On fait des copies locales des tableaux pour ne pas impacter les tableaux envoyés.
    tentative = tentative.slice();
    solution = solution.slice();
    // On identifie les chiffres bien positionnés
    for (let i = 0; i < tentative.length; i++) {
        if (tentative[i] == solution[i]) {
            tentative[i] = solution[i] = ".";
            indices.push("*");
        }
        else
            indices.push("_");
    }
    // Et ensuite les mal positionnés
    for (let i = 0; i < tentative.length; i++) {
        if (tentative[i] != ".") {
            for (let j = 0; j < solution.length; j++) {
                if (i !== j && solution[j] != "." && tentative[i] == solution[j]) {
                    tentative[i] = solution[j] = ".";
                    indices.splice(i, 1, "?");
                }
            }
        }
    }
    console.log(indices);

    // Pour des indices non-positionnels, on retire les non-correspondances
    if (!positionnel) {
        for (let i = indices.length - 1; i >= 0; i--) {
            if (indices[i] === "_")
                indices.splice(i, 1);
        }
        indices.sort();
    }
    return indices;
}

/*
    Fonction appelée lors du clic sur une case d'une tentative, pour faire afficher une barre de sélection.
*/
function traiterClicCase(ev) {
    let laCase = ev.target;
    if (laCase) {
        partie.derniereCaseCliquee = laCase;
        document.getElementById("barreSelectionChiffres").style.top = (ev.clientY - 10) + "px";
        document.getElementById("barreSelectionChiffres").style.left = (ev.clientX - 25) + "px";
        document.getElementById("barreSelectionChiffres").style.display = "flex";
    }
}

/*
    Exemple de la structure qui permettra de sauvegarder les records.
    Un tableau trié d'objets, où chaque objet décrit un des records.
    Dans l'exemple ci-dessous, on a 2 records enregistrés dans le tableau
*/
/*
    [
        {
            options: {
                MAX_TENTATIVES: 5,
                NB_CHIFFRES_COMBINAISON: 5,
                MAX_CHIFFRES: 7,
                INDICES_POSITIONNELS: true
            },
            nom: "Patrice",
            temps: 35,
            nbTentatives: 3
        },
        {
            options: {
                MAX_TENTATIVES: 10,
                NB_CHIFFRES_COMBINAISON: 6,
                MAX_CHIFFRES: 3,
                INDICES_POSITIONNELS: false
            },
            nom: "Isabelle",
            temps: 122,
            nbTentatives: 8
        }
    ]
*/