/**
 * @fileoverview Aviso de Privacidad Simplificado
 * RF3: Aviso de Privacidad y Consentimiento Explícito
 */

import { ArrowLeft, FileText } from 'lucide-react';
import styles from './AvisoPrivacidadPage.module.css';

interface Props {
  onBack: () => void;
}

export function AvisoPrivacidadSimplificadoPage({ onBack }: Props) {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <button onClick={onBack} className={styles.backBtn} aria-label="Regresar">
            <ArrowLeft size={24} />
          </button>
          <div className={styles.titleWrapper}>
            <FileText className={styles.icon} size={28} />
            <h1 className={styles.title}>Aviso de Privacidad Simplificado</h1>
          </div>
        </header>

        <div className={styles.content}>
          <p className={styles.intro}>
            <strong>CosasDeCasa</strong> valora su privacidad. Este es un resumen de cómo manejamos sus datos. Para más detalles, consulte nuestro Aviso de Privacidad Integral.
          </p>

          <section className={styles.section}>
            <h2>¿Para qué utilizamos sus datos?</h2>
            <p>
              Sus datos personales serán utilizados principalmente para:
            </p>
            <ul className={styles.bulletList}>
              <li>Administrar su cuenta y perfil dentro de la plataforma.</li>
              <li>Conectar de forma segura a clientes y profesionales.</li>
              <li>Validar la identidad de los usuarios y analizar documentos subidos mediante <strong>Inteligencia Artificial (IA)</strong> para garantizar la seguridad de nuestra comunidad.</li>
              <li>Enviar comunicaciones relevantes sobre sus solicitudes y servicios.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>¿Qué datos recabamos?</h2>
            <p>
              Recabamos datos básicos de contacto (como nombre y correo electrónico) y, en el caso de los profesionales, documentos de identificación y evidencias de trabajo (portafolio).
            </p>
          </section>

          <section className={styles.section}>
            <h2>Consentimiento y Tratamiento por IA</h2>
            <p>
              Es importante destacar que el análisis de documentos y portafolios se realiza utilizando herramientas de <strong>Inteligencia Artificial</strong>. Al registrarse o subir documentos a su perfil, le solicitaremos su <strong>consentimiento explícito</strong>. Sin este consentimiento, no podremos validar su perfil ni permitir la carga de sus archivos.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Más información</h2>
            <p>
              Usted tiene derecho a conocer qué datos personales tenemos, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección, eliminación o revocar su consentimiento.
            </p>
            <p>
              Si desea conocer más sobre nuestras prácticas de privacidad o ejercer sus derechos ARCO, por favor envíe un correo a <strong>privacidad@cosasdecasa.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
