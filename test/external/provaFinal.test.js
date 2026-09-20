/*
PROVA:
Automatizar testes para logar como administrador, cadastrar um aluno, logar como aluno e registrar a entrega de um trabalho como aluno (usar Mocha, SuperTest e Chai)
Testes precisam implementar Data-Driven Testing, adicionando dados usados no teste em um arquivo JSON 
O projeto deve usar Dotenv 
O projeto deve ter o login de Admin e de Usuário como Helpers 
Os testes precisam rodar na pipeline do Github Actions - Fazer

*/
import { comTokenDeAdmin, comTokenDeAlunoJaCriado } from '../../helpers/auth.js';
import { expect } from 'chai';
import { api } from '../../helpers/api.js';
import { novoAluno } from '../factories/alunosFactory.js';
import {novoTrabalhoParaEntregar} from '../factories/trabalhoDisciplinaFactory.js';
import disciplina from '../data/disciplinasCadastradas.json' with{type: 'json'};

describe('Validar funcionamento correto do fluxo de cadastro de aluno novo e entrega de trabalho desse aluno em uma disciplina', () =>{
    it('Validar sucesso no cadastro de um aluno novo e a entrega de um trabalho em uma disciplina',async ()=>{
        //cadastrar novo aluno
        const aluno = novoAluno();
        const cadastrarNovoAluno = await api()
            .post('/api/admin/alunos')
            .set('Content-Type', 'application/json')
            .set('Authorization', await comTokenDeAdmin())
            .send(aluno)

        expect(cadastrarNovoAluno.status).to.equal(201);
        expect(cadastrarNovoAluno.body.email).to.be.equal(aluno.email);
        
        //Verificar disciplina ja cadastrada
        const verificarDisciplinasJaCadastradas = await api()
            .get('/api/admin/disciplinas')
            .set('Authorization', await comTokenDeAdmin())

        expect(verificarDisciplinasJaCadastradas.status).to.equal(200);

        //tornar os dois em um array de string com apenas as disciplinas
        const idDasDisciplinasEncontradas = verificarDisciplinasJaCadastradas.body.map(disciplinas => disciplinas.id);
        const idDasDisciplinasDoJson = disciplina.map(disciplinas => disciplinas.id);
        expect(idDasDisciplinasEncontradas).to.contain.members(idDasDisciplinasDoJson);
       
        for (const disciplinaAtual of disciplina) {
            //Matricular aluno em uma disciplina
            const matricularAlunoNovoEmUmaDisciplina = await api()
                .post(`/api/admin/disciplinas/${disciplinaAtual.id}/matriculas`)
                .set('Content-Type', 'application/json')
                .set('Authorization', await comTokenDeAdmin())
                .send({
                    alunoId: cadastrarNovoAluno.body.id
                })
            expect(matricularAlunoNovoEmUmaDisciplina.status).to.equal(201);
            expect(matricularAlunoNovoEmUmaDisciplina.body.alunoId).to.be.equal(cadastrarNovoAluno.body.id);
            expect(matricularAlunoNovoEmUmaDisciplina.body.disciplinaId).to.be.equal(disciplinaAtual.id);
        
            //entregar o trabalho
            const informacoesTrabalhoEntregue = novoTrabalhoParaEntregar(disciplinaAtual.id);    

            const entregaDeTrabalho = await api()
                .post(`/api/alunos/${cadastrarNovoAluno.body.id}/trabalhos`)
                .set('Content-Type', 'application/json')
                .set('Authorization', await comTokenDeAlunoJaCriado(aluno))
                .send(informacoesTrabalhoEntregue)

            expect(entregaDeTrabalho.status).to.equal(201);
            expect(entregaDeTrabalho.body.titulo).to.not.be.empty;
            expect(entregaDeTrabalho.body.descricao).to.not.be.empty;
            expect(entregaDeTrabalho.body.id).to.not.be.empty;
            expect(entregaDeTrabalho.body.status).to.equal('entregue');
            expect(entregaDeTrabalho.body.disciplinaId).to.be.equal(disciplinaAtual.id);
            expect(entregaDeTrabalho.body.alunoId).to.be.equal(cadastrarNovoAluno.body.id);
            expect(entregaDeTrabalho.body.titulo).to.be.equal(informacoesTrabalhoEntregue.titulo);
            expect(entregaDeTrabalho.body.descricao).to.be.equal(informacoesTrabalhoEntregue.descricao);
            
            //Verificar o trabalho que foi entregue
            const listaDosTrabalhosEntregues = await api()
                .get(`/api/alunos/${cadastrarNovoAluno.body.id}/trabalhos`)
                .set('Authorization', await comTokenDeAlunoJaCriado(aluno))

            expect(listaDosTrabalhosEntregues.status).to.equal(200);
            expect(listaDosTrabalhosEntregues.body.map(trabalho => trabalho.titulo === entregaDeTrabalho.body.titulo)).to.contain(true);
            expect(listaDosTrabalhosEntregues.body.map(trabalho => trabalho.descricao === entregaDeTrabalho.body.descricao)).to.contain(true);
            expect(listaDosTrabalhosEntregues.body.map(trabalho => trabalho.alunoId === cadastrarNovoAluno.body.id)).to.contain(true);
        }

    });
})