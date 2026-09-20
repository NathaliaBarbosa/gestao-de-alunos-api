import { faker } from "@faker-js/faker";

export function novoTrabalhoParaEntregar(disciplinaId){
    const tituloTrabalho = faker.book.title();
    const descricaoDoTrabalho = faker.lorem.sentence();
    
    
    return{
        disciplinaId: `${disciplinaId}`,
        titulo: `${tituloTrabalho}`,
        descricao: `${descricaoDoTrabalho}`
    };
}