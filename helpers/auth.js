import 'dotenv/config';
import { api } from './api.js';

let tokenEmCacheAdmin = null;
let tokenEmCacheAlunoJacriado = null;

export async function comTokenDeAdmin() {
   //SE NÃO TIVER TOKEN EM CACHE FAZER... 
   if (!tokenEmCacheAdmin){ 
    const tokenLogin = await api()
        .post ('/api/auth/login')
        .set('content-type', 'application/json')
        .send({
            email: process.env.ADMIN_EMAIL,
            senha: process.env.ADMIN_SENHA
        });
     tokenEmCacheAdmin = tokenLogin.body.token;   
   }
   return `Bearer ${tokenEmCacheAdmin}`;
};

export async function comTokenDeAlunoJaCriado(aluno){
    if (!tokenEmCacheAlunoJacriado){
     const tokenLoginAlunoJaCriado = await api()
        .post ('/api/auth/login')
        .set('content-type', 'application/json')
        .send(aluno);
     tokenEmCacheAlunoJacriado = tokenLoginAlunoJaCriado.body.token;   
   }
   return `Bearer ${tokenEmCacheAlunoJacriado}`;
}