import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InternalServerErrorException, ValidationPipe } from '@nestjs/common';
import { assert } from 'console';
var ip = require("ip");

const listen_port: string = '3000';


// Defines the 'IP_ADDR_LOCAL' env variable.
function append_ip_to_env(): string {
  const addr: string = ip.address();

  if (!addr)
    throw new InternalServerErrorException('Missing environment variables');
  process.env['IP_ADDR_LOCAL'] = addr;
  return (addr);
}

function append_42oauth_redirect_to_env(ip_addr: string): string {
  const redirect_uri: string = 'http%3A%2F%2F' + ip_addr + '%3A' + listen_port + '%2Fauth%2F42oauth_token';

  if (!redirect_uri)
    throw new InternalServerErrorException('Missing environment variables');
  process.env['42OAUTH_REDIRECT_URI'] = redirect_uri;
  return (redirect_uri);
}

// Defines the 'IP_ADDR_LOCAL' env variable.
function append_42oauth_url_to_env(redirect_uri: string): string {

  const base_url: string = process.env['42OAUTH_BASE_URL'];
  const client_uid: string = process.env['42OAUTH_UID'];
  const state_secret: string = process.env['42OAUTH_STATE'];

  let url: string = base_url;
  url += '?client_id=' + client_uid;
  url += '&redirect_uri=' + redirect_uri;
  //url += '&state=' + state_secret;
  url += '&response_type=code';
  
  if (!base_url || !client_uid || !url)
    throw new InternalServerErrorException('Missing environment variables');
  process.env['42OAUTH_URL'] = url;
  return (url);
}

function setup_42oauth_env_vars() {

  const ip_addr: string = append_ip_to_env();
  const redirect_uri: string = append_42oauth_redirect_to_env(ip_addr);
  //const url: string = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-060054ee82cdef75be259160866ffaa26f98cef72e59311abfcb9bc609175caf&redirect_uri=http%3A%2F%2F10.11.4.3%3A3000%2Fauth%2F42oauth&response_type=code";//append_42oauth_url_to_env(redirect_uri);
  const url: string = append_42oauth_url_to_env(redirect_uri);
  if (!ip_addr || !redirect_uri || !url)
    throw new InternalServerErrorException('Missing environment variables');

  console.log('42OAuth URL : ' + url);
}

async function bootstrap() {

  setup_42oauth_env_vars();

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }))
  console.log(process.env['IP_ADDR_LOCAL']);
  //await app.listen(process.env.NESTJS_PORT ? process.env.NESTJS_PORT : 3000);
  await app.listen(listen_port);
}
bootstrap();
