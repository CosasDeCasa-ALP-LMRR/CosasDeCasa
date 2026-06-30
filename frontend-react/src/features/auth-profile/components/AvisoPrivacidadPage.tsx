/**
 * @fileoverview Aviso de Privacidad Integral
 * RF3: Aviso de Privacidad y Consentimiento Explícito
 */

import { ArrowLeft, Shield } from 'lucide-react';
import styles from './AvisoPrivacidadPage.module.css';

interface Props {
  onBack: () => void;
}

export function AvisoPrivacidadPage({ onBack }: Props) {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <button onClick={onBack} className={styles.backBtn} aria-label="Regresar">
            <ArrowLeft size={24} />
          </button>
          <div className={styles.titleWrapper}>
            <Shield className={styles.icon} size={28} />
            <h1 className={styles.title}>Aviso de Privacidad Integral</h1>
          </div>
        </header>

        <div className={styles.content}>
          <p className={styles.intro}>
            <strong>CosasDeCasa</strong>, con domicilio virtual en nuestra plataforma
            en línea, es el responsable del tratamiento de los datos personales
            que nos proporcione, los cuales serán protegidos conforme a lo dispuesto
            por la normatividad de protección de datos personales aplicable.
          </p>

          <section className={styles.section}>
            <h2>Finalidad del Tratamiento</h2>
            <p>
              Los datos personales que recabemos de usted, los utilizaremos para
              las siguientes actividades principales:
            </p>
            <ol className={styles.list}>
              <li>Creación y administración de su cuenta en la plataforma.</li>
              <li>Validación de identidad y verificación de perfiles profesionales.</li>
              <li>Conexión entre clientes y profesionales para la prestación de servicios del hogar.</li>
              <li>Tratamiento de documentos e imágenes de portafolio mediante algoritmos de <strong>Inteligencia Artificial (IA)</strong> para su análisis, categorización y validación automática.</li>
              <li>Envío de notificaciones operativas sobre servicios, seguridad y estado de su cuenta.</li>
            </ol>
            <p>
              De manera adicional, utilizaremos su información personal para fines estadísticos
              y de mejora continua de nuestra plataforma, sin que sus datos sean identificables.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Consentimiento para el Uso de Inteligencia Artificial (IA)</h2>
            <p>
              CosasDeCasa utiliza herramientas de Inteligencia Artificial para el análisis de los documentos y fotografías
              que usted carga en su portafolio profesional. El propósito de este análisis es asegurar la calidad,
              veracidad y seguridad de los servicios ofrecidos en la plataforma.
            </p>
            <p>
              Al momento de registrar su cuenta y/o subir un documento, se le solicitará su <strong>consentimiento explícito</strong> para que 
              sus datos sean procesados bajo estos términos. Sin este consentimiento, la plataforma no permitirá la subida de dichos archivos.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Datos personales y sensibles recabados</h2>
            <p>
              Para las finalidades antes señaladas, se solicitan los siguientes datos personales:
            </p>
            <ul className={styles.bulletList}>
              <li>Nombre(s) y apellido(s) completos</li>
              <li>Correo electrónico</li>
              <li>Fotografías de perfil y evidencias de trabajo (portafolio)</li>
              <li>Documentos de identificación oficial (INE, pasaporte, etc.)</li>
              <li>Certificaciones profesionales y Cédula Profesional</li>
              <li>Datos de ubicación o zona de servicio</li>
            </ul>
            <p>
              <strong>Tratamiento de documentos sensibles:</strong> Sus documentos de identificación oficial (INE, Cédula Profesional, entre otros) serán manejados <strong>estrictamente de forma manual por un Auditor</strong> designado por la plataforma. 
              Una vez que su cuenta y perfil como profesionista hayan sido validados y verificados satisfactoriamente, <strong>estos documentos sensibles serán eliminados permanentemente</strong> de nuestros servidores por motivos de seguridad y privacidad.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Transferencia de datos</h2>
            <p>
              Se le informa que sus datos personales no serán transferidos a terceros sin su consentimiento,
              salvo en los casos que las autoridades competentes lo requieran mediante un proceso legal,
              o cuando sea estrictamente necesario para la prestación del servicio que usted ha solicitado.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Derechos ARCO y Contacto</h2>
            <p>
              Para el ejercicio de cualquiera de sus derechos de Acceso, Rectificación, Cancelación u Oposición (ARCO), 
              usted podrá presentar su solicitud enviando un correo electrónico a nuestro equipo de soporte.
            </p>
            <div className={styles.contactCard}>
              <h3>Datos de Contacto</h3>
              <p><strong>Departamento de Privacidad:</strong> CosasDeCasa Soporte</p>
              <p><strong>Correo electrónico:</strong> privacidad@cosasdecasa.com</p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Cambios al aviso de privacidad</h2>
            <p>
              En caso de realizar alguna modificación al aviso de privacidad, se le notificará
              a través de nuestra plataforma web y/o mediante el correo electrónico asociado a su cuenta.
            </p>
            <p className={styles.updateDate}>
              <em>Última actualización: 28 de junio de 2026</em>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
