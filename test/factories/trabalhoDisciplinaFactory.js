import { faker } from "@faker-js/faker";
import disciplina from '../data/disciplinasCadastradas.json' with{type: 'json'};

export function novoTrabalhoParaEntregar(){
    const tituloTrabalho = faker.book.title();
    const descricaoDoTrabalho = faker.lorem.sentence();
    
    
    return{
        disciplinaId: `${disciplina[0].id}`,
        titulo: `${tituloTrabalho}`,
        descricao: `${descricaoDoTrabalho}`
    };
}