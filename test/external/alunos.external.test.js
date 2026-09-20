import { expect } from 'chai';
import { api } from '../../helpers/api.js';
import { comTokenDeAdmin } from '../../helpers/auth.js';
import { novoAluno } from '../factories/alunosFactory.js';
import request from 'supertest';

describe('Validar a API de Alunos', () => {
    const aluno = novoAluno();
    it('Usando os arquivos helpers- Validar o cadastro correto de um aluno', async () => {
        const cadastroDeAluno = await api()
            .post('/api/admin/alunos')
            .set('content-type', 'application/json')
            .set('Authorization', await comTokenDeAdmin())
            .send(aluno)

        console.log(`Cadastro de aluno: ` + cadastroDeAluno.body.nome);
        console.log(cadastroDeAluno.body.email);
        console.log(cadastroDeAluno.body.matricula);
        
        expect(cadastroDeAluno.body.nome).to.not.be.empty;
        expect(cadastroDeAluno.status).to.equal(201);
        expect(cadastroDeAluno.body.email).to.not.be.empty;
        expect(cadastroDeAluno.body.matricula).to.not.be.empty;
        expect(cadastroDeAluno.body.id).to.not.be.empty; 
        expect(cadastroDeAluno.body.role).to.not.be.empty; 
    });

    it('Sem usar os arquivos helpers- Validar o cadastro correto de um aluno', async () => {
        
        const tokenLogin = await request('http://localhost:3000')
                .post ('/api/auth/login')
                .set('content-type', 'application/json')
                .send({
                    email: 'admin@escola.com',
                    senha: 'admin123'
                });
         expect(tokenLogin.status).to.equal(200);
         const tokenDeAdmin = tokenLogin.body.token;  
        

        const cadastroDeAluno = await request('http://localhost:3000')
            .post('/api/admin/alunos')
            .set('content-type', 'application/json')
            //.set('Authorization', 'Bearer',tokenDeAdmin)
            .set('Authorization', `Bearer ${tokenDeAdmin}`)
            .send({
                nome: 'Rafael Pereira',
                email: 'rafael.pereira@example.com',
                matricula: '965425',
                senha: '123456'
            })
          expect(cadastroDeAluno.status).to.equal(201);
    });

    it('Utilizando os helpers e deixando o teste DEPENDENTE de outro it- Validar erro 409 ao tentar efetuar o cadastro de um aluno já cadastrado', async ()=> {
        const cadastroDoMesmoAluno = await api()
            .post('/api/admin/alunos')
            .set('content-type', 'application/json')
            .set('Authorization', await comTokenDeAdmin())
            .send(aluno)
        
        console.log(`Mesmo cadastro de aluno: ` + aluno.nome);
        console.log(aluno.email);
        console.log(aluno.matricula);
        
        expect(cadastroDoMesmoAluno.status).to.equal(409);
        expect(cadastroDoMesmoAluno.body.error).to.equal('Já existe um aluno cadastrado com essa matrícula ou e-mail.');
    });
        
});

describe('Utilizando os arquivos helpers - Validação do cadastro de aluno e erro ao cadastrar o mesmo aluno em testes independentes ', ()=>{
    it('Validar o cadastro correto de um aluno', async ()=> {
        const cadastroDeAluno = await api()
            .post('/api/admin/alunos')
            .set('content-type', 'application/json')
            .set('Authorization', await comTokenDeAdmin())
            .send(novoAluno())

        console.log(`Cadastro de aluno: ` + cadastroDeAluno.body.nome);
        console.log(cadastroDeAluno.body.email);
        console.log(cadastroDeAluno.body.matricula);
        
        expect(cadastroDeAluno.body.nome).to.not.be.empty;
        expect(cadastroDeAluno.status).to.equal(201);
        expect(cadastroDeAluno.body.email).to.not.be.empty;
        expect(cadastroDeAluno.body.matricula).to.not.be.empty;
        expect(cadastroDeAluno.body.id).to.not.be.empty; 
        expect(cadastroDeAluno.body.role).to.not.be.empty;
    });

    it('Validar erro ao tentar cadastrar um aluno já existente', async ()=> {
        //esse banco de dados que estamos usando já tem alunos cadastrados como padrão então podemos utilizar eles
        const cadastroAlunoExistente = await api()
            .post('/api/admin/alunos')
            .set('content-type', 'application/json')
            .set('Authorization', await comTokenDeAdmin())
            .send({
                nome: 'Bruno Lima', 
                email: 'bruno.lima@example.com', 
                matricula: '2024002',
                senha: '123456'
            })
        expect(cadastroAlunoExistente.status).to.equal(409);
        expect(cadastroAlunoExistente.body.error).to.equal('Já existe um aluno cadastrado com essa matrícula ou e-mail.')
    });
});

