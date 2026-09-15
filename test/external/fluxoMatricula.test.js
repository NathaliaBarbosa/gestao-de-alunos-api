import  { api } from '../../helpers/api.js';
import { expect } from 'chai';
import { comTokenDeAdmin } from '../../helpers/auth.js';
import { novoAluno } from '../factories/alunosFactory.js';
import { novaDisciplina } from '../factories/disciplinaFactory.js';


describe('Validação do fluxo de login, cadastro de usuário e disciplina, e matricula do aluno na disciplina', () => {
    it('Validar que um aluno que acaba de ser cadastrado pode ser matriculado em uma nova disciplina', async ()=>{
        
        const cadastroAluno = await api()
            .post('/api/admin/alunos')
            .set('content-type', 'application/json')
            .set('Authorization', await comTokenDeAdmin())
            .send(novoAluno());
        const idAluno = cadastroAluno.body.id;
        

        const cadastroDisciplinas = await api()
            .post('/api/admin/disciplinas')
            .set('content-type', 'application/json')
            .set('Authorization', await comTokenDeAdmin())
            .send(novaDisciplina());
        
        const idDisciplina = cadastroDisciplinas.body.id;
        console.log(idDisciplina);
        
        const cadastroAlunoNaDisciplina = await api()
            .post(`/api/admin/disciplinas/${idDisciplina}/matriculas`)
            .set('content-type', 'application/json')
            .set('Authorization', await comTokenDeAdmin())
            .send({
                alunoId: idAluno
            });
    
    
    expect(cadastroAlunoNaDisciplina.status).to.equal(201);
    expect(cadastroAlunoNaDisciplina.body.alunoId).to.equal(idAluno);
    expect(cadastroAlunoNaDisciplina.body.disciplinaId).to.equal(idDisciplina);

    });

})
