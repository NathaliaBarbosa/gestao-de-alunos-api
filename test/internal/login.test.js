import request from 'supertest';
import app from '../../src/app.js';
import { expect } from 'chai';
import * as sinon from 'sinon';
import authService from '../../src/services/auth.service.js';

//request é a biblioteca utilizada para fazer as requisições, é a representação do supert
//app é a API que vc esta testando
//aqui estamos pulando a chamada no servidor e chamando direto o APP.js
//set: cabeçalho
//send: é o body da requisição
//status é uma propriedade
//o que esta dentro do send é um objeto no javascript, ele é identico ao json mas 
//o json tem as ' ' e o objeto não. os atributos são os campos "email" e "senha"
//outro atributo é content-type e ele ta entre ' ' por causa do -

describe('Testes de login', () => {
    it('Validar retorno 200 quando o usuário e senha forem corretor', async () => {
        const loginResposta = await request(app)
            .post('/api/auth/login')
            .set('Content-Type', 'application/json')
            .send({
                email: 'admin@escola.com',
                senha: 'admin123'
            });
        expect(loginResposta.status).to.equal(200);
    });

    it('Validar retorno 401 quando o email for incorreto', async () => {
        const loginResposta = await request(app)
            .post('/api/auth/login')
            .set('Content-Type', 'application/json')
            .send({
                email: 'admin2@escola.com',
                senha: 'admin123'
            });
        expect(loginResposta.status).to.equal(401);
        expect(loginResposta.body.error).to.equal('E-mail ou senha inválidos.');
    });
    it('Validar retorno 401 quando a senha for incorreta', async () => {
        const loginResposta = await request(app)
            .post('/api/auth/login')
            .set('Content-Type', 'application/json')
            .send({
                email: 'admin@escola.com',
                senha: 'admin1234'
            });
        expect(loginResposta.status).to.equal(401);
        expect(loginResposta.body.error).to.equal('E-mail ou senha inválidos.');
    });
    it('Validar retorno 400 quando a senha não for informada', async () => {
        const loginResposta = await request(app)
            .post('/api/auth/login')
            .set('Content-Type', 'application/json')
            .send({
                email: 'admin2@escola.com',
                senha: ''
            });
        expect(loginResposta.status).to.equal(400);
        expect(loginResposta.body.error).to.equal('Os campos "email" e "senha" são obrigatórios.');
    });
    
    it('Validar retorno 400 quando o email não for informado', async () => {
        const loginResposta = await request(app)
            .post('/api/auth/login')
            .set('Content-Type', 'application/json')
            .send({
                email: '',
                senha: 'admin1234'
            });
        expect(loginResposta.status).to.equal(400);
        expect(loginResposta.body.error).to.equal('Os campos "email" e "senha" são obrigatórios.');
    });
});

describe('Validação das integrações com mock', () =>{
    //no caso estamos usando o sinon para criar o mock.
    //aqui tivemos que alterar o import do arquivo auth.controller.js
    it('Validar retorno 500 quando acontecer algum problema de conexão com o banco de dados', async () => {
        
        const authServiceMock = sinon.stub(authService, 'login');
        authServiceMock.throws(new Error('ERRO CATASTROFICO'));
        
        const loginResposta = await request(app)
            .post('/api/auth/login')
            .set('Content-Type', 'application/json')
            .send({
                email: 'admin@escola.com',
                senha: 'admin123'
            });
        expect(loginResposta.status).to.equal(500);
        expect(loginResposta.body.error).to.equal('Erro interno do servidor.');

        sinon.restore();
    });
});