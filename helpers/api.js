import request from 'supertest';
import 'dotenv/config';

//aqui o || é como se fosse SE NÃO tiver no env pegar esse q passei

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

export function api() {
    return request(BASE_URL);
}