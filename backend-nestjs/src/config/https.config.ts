import * as fs from 'fs';
import * as path from 'path';
import * as selfsigned from 'selfsigned';

export async function getHttpsOptions(): Promise<
  { key: string; cert: string } | undefined
> {
  if (process.env.NODE_ENV === 'production') {
    return undefined; // In production, we assume a reverse proxy like Nginx handles HTTPS
  }

  const certsDir = path.join(process.cwd(), '.certs');
  const keyPath = path.join(certsDir, 'localhost.key');
  const certPath = path.join(certsDir, 'localhost.crt');

  if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true });
  }

  let key: string;
  let cert: string;

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    key = fs.readFileSync(keyPath, 'utf8');
    cert = fs.readFileSync(certPath, 'utf8');
  } else {
    // Generate new self-signed certificates
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = await selfsigned.generate(attrs);

    key = pems.private;
    cert = pems.cert;

    fs.writeFileSync(keyPath, key);
    fs.writeFileSync(certPath, cert);

    // Also save public key just in case it's needed
    fs.writeFileSync(path.join(certsDir, 'localhost.pub'), pems.public);
  }

  return { key, cert };
}
