/*
PROVA:
Automatizar testes para logar como administrador, cadastrar um aluno, logar como aluno e registrar a entrega de um trabalho como aluno (usar Mocha, SuperTest e Chai) - Feito
Testes precisam implementar Data-Driven Testing, adicionando dados usados no teste em um arquivo JSON - Feito
O projeto deve usar Dotenv - Feito
O projeto deve ter o login de Admin e de Usuário como Helpers - Feito
Os testes precisam rodar na pipeline do Github Actions - Fazer

Passos:
1.Describe com it com todos os passos seguidos:
    -logar adm
    -cadastro de um aluno (não pode ser repetido)
    -cadastrar o aluno em uma disciplina 
    -logar como o novo aluno
    -entregar um trabalho
2.Describe com um it para cada endpoint para ser testes independentes
3.Data-Driven testing:
    -Adicionar o usuário, disciplina e trabalho em um arquivo JSON
4.FakeFiler para:
    -aluno: Ja tem
    -disciplina: Ja tem
    -trabalho: Feito
5.Dotenv:
    -localhost
    -usuario admin 
    -senha admin
6.Helpers:
    -função admin: Já existe
    -função acesso aluno: Feito 
7.yaml:
    -criar arquivo yaml pora rodar na pipe toda vez que houver um push.

*/
import { comTokenDeAdmin, comTokenDeAlunoJaCriado } from '../../helpers/auth.js';
import { expect } from 'chai';
import { api } from '../../helpers/api.js';
import { novoAluno } from '../factories/alunosFactory.js';
import {novoTrabalhoParaEntregar} from '../factories/trabalhoDisciplinaFactory.js';
import disciplina from '../data/disciplinasCadastradas.json' with{type: 'json'};

describe('Fluxo completo em um it - Validar fluxo de cadastro de aluno com entrega de trabalho do aluno cadastrado', () =>{
    it.only('Validar entrega de trabalho funcionando do aluno cadastrado na disciplina',async ()=>{
        //cadastrar novo aluno
        const aluno = novoAluno();
        const cadastrarNovoAluno = await api()
            .post('/api/admin/alunos')
            .set('Content-Type', 'application/json')
            .set('Authorization', await comTokenDeAdmin())
            .send(aluno)

        expect(cadastrarNovoAluno.status).to.equal(201);
        expect(cadastrarNovoAluno.body).to.not.be.empty;
        expect(cadastrarNovoAluno.body.email).to.not.be.empty;
        expect(cadastrarNovoAluno.body.matricula).to.not.be.empty;
        expect(cadastrarNovoAluno.body.id).to.not.be.empty; 
        expect(cadastrarNovoAluno.body.role).to.not.be.empty;
        expect(cadastrarNovoAluno.body.nome).to.not.be.empty;
        expect(cadastrarNovoAluno.body.createdAt).to.not.be.empty;
        expect(cadastrarNovoAluno.body.updatedAt).to.not.be.empty;
        expect(cadastrarNovoAluno.body.email).to.be.equal(aluno.email);

        console.log(`Informações da variavel ALUNO:`, aluno)
        console.log(`Informações do retorno do cadastro de aluno:`, cadastrarNovoAluno.body);
        
        //matricular aluno em uma disciplina ja cadastrada
        //retorna um ARRAY
        const verificarDisciplinasJaCadastradas = await api()
            .get('/api/admin/disciplinas')
            .set('Authorization', await comTokenDeAdmin())

        expect(verificarDisciplinasJaCadastradas.status).to.equal(200)

        console.log(`Verificar as disciplinas retornadas pelo endpoint`, verificarDisciplinasJaCadastradas.body)
        console.log(`Verificar as disciplinas cadastradas no JSON`, disciplina);

        //tornar os dois em um array de string com apenas as disciplinas
        const idDasDisciplinasEncontradas = verificarDisciplinasJaCadastradas.body.map(disciplinas => disciplinas.id);
        const idDasDisciplinasDoJson = disciplina.map(disciplinas => disciplinas.id);

        expect(idDasDisciplinasEncontradas).to.have.members(idDasDisciplinasDoJson);

        console.log(`Verificar as disciplinas encontradas no endpoint:`, idDasDisciplinasEncontradas);
        console.log(`Verificar as disciplinas do Json:`, idDasDisciplinasDoJson);
        

        //Matricular aluno em uma disciplina
        const matricularAlunoNovoEmUmaDisciplina = await api()
            .post(`/api/admin/disciplinas/${disciplina[0].id}/matriculas`)
            .set('Content-Type', 'application/json')
            .set('Authorization', await comTokenDeAdmin())
            .send({
                alunoId: cadastrarNovoAluno.body.id
            })
        expect(matricularAlunoNovoEmUmaDisciplina.status).to.equal(201);
        expect(matricularAlunoNovoEmUmaDisciplina.body.id).to.not.be.empty;
        expect(matricularAlunoNovoEmUmaDisciplina.body.alunoId).to.not.be.empty;
        expect(matricularAlunoNovoEmUmaDisciplina.body.disciplinaId).to.not.be.empty;
        expect(matricularAlunoNovoEmUmaDisciplina.body.dataMatricula).to.not.be.empty;
        expect(matricularAlunoNovoEmUmaDisciplina.body.alunoId).to.be.equal(cadastrarNovoAluno.body.id);
        expect(matricularAlunoNovoEmUmaDisciplina.body.disciplinaId).to.be.equal(disciplina[0].id);
     
        //entregar o trabalho
        const informacoesTrabalhoEntregue = novoTrabalhoParaEntregar();    

        const entregaDeTrabalho = await api()
            .post(`/api/alunos/${cadastrarNovoAluno.body.id}/trabalhos`)
            .set('Content-Type', 'application/json')
            .set('Authorization', await comTokenDeAlunoJaCriado(aluno))
            .send(informacoesTrabalhoEntregue)

        expect(entregaDeTrabalho.status).to.equal(201);
        console.log(`Retorno do trabalho que foi entregue para o usuário enviado:`,entregaDeTrabalho.body);
        expect(entregaDeTrabalho.body.titulo).to.not.be.empty;
        expect(entregaDeTrabalho.body.descricao).to.not.be.empty;
        expect(entregaDeTrabalho.body.id).to.not.be.empty;
        expect(entregaDeTrabalho.body.status).to.equal('entregue');
        expect(entregaDeTrabalho.body.disciplinaId).to.be.equal(disciplina[0].id);
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
        console.log('Retorno da lista de trabalhos entregues para o usuário pesquisado:', listaDosTrabalhosEntregues.body);


    });
});

describe('Fluxo completo em it diferentes- Validar fluxo de cadastro de aluno com entrega de trabalho do aluno cadastrado', () =>{
    it('Validar acesso com sucesso do administrador',async ()=>{

    });

    it('Validar cadastro com sucesso de um novo aluno',async ()=>{

    });

    it('Validar cadastro com sucesso do aluno novo em uma disciplina',async ()=>{

    });

    it('Validar acesso com sucesso do novo aluno',async ()=>{

    });

    it('Validar entrega do trbalho com sucesso do novo aluno na disciplina que o mesmo foi cadastrado',async ()=>{

    })
});