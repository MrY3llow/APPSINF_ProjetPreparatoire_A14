// fonction qui transforme un string en un array composé dictionnaire qui associe un nombre d'occurence à chaque mot
// et d'un int qui représente la quantité total de mot
function countWords(text) {
    const text1=text.toLowerCase();
    const text2=text1.replace(/[^\p{L}\p{N}\s]/gu, "");
    const text3=text2.trim().split(/\s+/);

    const words_count = {};

    for (let i=0; i<text3.length; i+=1) {
        if (words_count[text3[i]]) {
            words_count[text3[i]]+=1;
        }
        else {
            words_count[text3[i]]=1;
        }
    }
    return [words_count,text3.length];
}

// fonction qui associe un poid à chaque mot pour trier les string dans incident list 
// la fonction prend 1 string (l'input de la recherche) et une liste de string (la liste des incidents)
function wheightOrder(input, incident_list) {
    const wheight_list=[];
    const incident_list_count=[];
    
    const input_count=countWords(input);

    for (let l=0; l<incident_list.length; l+=1) {
        incident_list_count.push(countWords(incident_list[l]));
        wheight_list.push(0);
    }
    
    for (const word in input_count[0]) {
        let count=0;
        
        // compte dans combien d'incident le mot apparait
        for (let i=0; i<incident_list.length; i+=1) {
            if (incident_list_count[i][0][word]) {
                count+=1
            }
        }

        for (let j=0; j<incident_list.length; j+=1) {
            if (incident_list_count[j][0][word]) {
                const x=1 + (incident_list_count[j][0][word] / incident_list_count[j][1]);
                const TF=Math.log10(x);

                const y=incident_list_count.length / count;
                const IDF=Math.log10(y)

                // ajoute le poid du mot au poid total de l'incident
                wheight_list[j]+=TF+IDF
            }
        }
    }
    // associe chaque incident à son poid et trie en fonction du poid
    let paired=incident_list.map((str, m) => [str, wheight_list[m]]);
    paired.sort((a, b) => b[1]-a[1]);
    let sorted_incidents=paired.map((pair) => pair[0]);
    
    return sorted_incidents;
}

const input1="J'ai mangé des pâtes au jambon, j'ai mal au ventre parce que les pâtes sont empoisonnées.";
const incident1="J'ai vu quelqu'un faire des pâtes empoisonées qui font mal au ventre.";
const incident2="J'ai perdu mon chien.";
const incident3="J'ai mangé une pizza au jambon.";
const incident_list=[incident1, incident2, incident3];



console.log(wheightOrder(input1, incident_list));