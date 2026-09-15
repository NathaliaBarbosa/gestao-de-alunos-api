import 'dotenv/config';
import { api } from './api.js'

let tokenEmCache = null

export async function comTokenDeAdmin() {
   //SE NÃO TIVER TOKEN EM CACHE FAZER... 
   if (!tokenEmCache){ 
    const tokenLogin = await api()
        .post ('/api/auth/login')
        .set('content-type', 'application/json')
        .send({
            email: process.env.ADMIN_EMAIL,
            senha: process.env.ADMIN_SENHA
        });
     tokenEmCache = tokenLogin.body.token;   
   }
   return `Bearer ${tokenEmCache}`;
}