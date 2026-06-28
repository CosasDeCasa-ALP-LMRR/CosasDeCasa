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
            La <strong>Universidad Tecnológica del Norte de Guanajuato</strong>, con domicilio en
            Avenida Educación Tecnológica número 34, Fraccionamiento Universidad,
            Código Postal 37800, en la Ciudad de Dolores Hidalgo Cuna de la
            Independencia Nacional, Guanajuato, es el responsable del
            tratamiento de los datos personales que nos proporcionen, los cuales
            serán protegidos conforme a lo dispuesto por la Ley de Protección de
            Datos Personales en Posesión de Sujetos Obligados para el Estado de
            Guanajuato, y demás normatividad que resulte aplicable.
          </p>

          <section className={styles.section}>
            <h2>Finalidad del Tratamiento</h2>
            <p>
              Los datos personales que recabemos de usted, los utilizaremos para
              las siguientes actividades:
            </p>
            <ol className={styles.list}>
              <li>Prestación del servicio público educativo.</li>
              <li>
                Proceso de ingreso para cursar algún programa educativo ofertado
                por la Universidad, relacionado con tramites de registro de
                aspirantes (fichas), aplicación de examen de diagnóstico,
                inscripciones y reinscripciones.
              </li>
              <li>
                Emisión de constancia y certificado de estudio, historial
                académico, título y cédula profesional.
              </li>
              <li>Generar lista de asistencia de grupo.</li>
              <li>Generar reportes de evaluaciones.</li>
              <li>
                Desarrollo de visitas, prácticas profesionales y estadías en el
                sector productivo y social.
              </li>
              <li>
                Registro, atención y seguimiento de estudiantes a través de
                tutorías y asesorías académicas.
              </li>
              <li>Registro de seguimiento de egresados y bolsa de trabajo.</li>
              <li>Prestación del servicio psicopedagógico.</li>
              <li>Registro del servicio médico incluyendo exámenes médicos.</li>
              <li>Gestión y otorgamiento de apoyos escolares (becas).</li>
              <li>Actividades culturales y deportivas.</li>
              <li>
                Servicios al estudiantado como: biblioteca, laboratorios y
                talleres.
              </li>
              <li>
                Realización o gestión de trámites administrativos y académicos
                para revalidaciones y equivalencias de estudios.
              </li>
              <li>
                Participación en convocatorias a: proyectos, congresos, cursos,
                talleres, cualquier otro similar, en los que represente a la
                Universidad.
              </li>
              <li>
                Actividades de movilidad e intercambio del estudiantado y/o del
                profesorado.
              </li>
              <li>
                Registro de necesidades de capacitación para educación continua.
              </li>
              <li>Registro para inscripción a cursos de educación continua.</li>
              <li>
                Registro de llenado de ficha técnica y registro en la etapa de
                evaluación y selección de proyectos de la Incubadora de Empresas
                de la UTNG.
              </li>
              <li>
                Actualización de datos del punto anterior para la etapa de
                incubación.
              </li>
              <li>
                Actualización de datos del punto anterior para la etapa de
                post-incubación.
              </li>
              <li>Desarrollo de servicios tecnológicos.</li>
              <li>
                Uso de imagen, voz, para difusión y promoción de actividades
                institucionales por medios impresos, electrónicos o cualquier
                otra modalidad.
              </li>
              <li>Alta ante el Instituto Mexicano de Seguro Social.</li>
            </ol>
            <p>
              De manera adicional, se requiere su consentimiento para que los
              datos personales optativos solicitados sean de utilidad con fines
              estadísticos sin que se haga identificables a los titulares, para
              mejorar los servicios e implementar medidas que resulten
              pertinentes que impulsen el ejercicio de los derechos ARCO.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Datos personales recabados</h2>
            <p>
              Para las finalidades antes señaladas se solicitan los siguientes
              datos personales:
            </p>
            <ul className={styles.bulletList}>
              <li>Nombre(s) y apellido(s) completos</li>
              <li>Edad, Género, Sexo</li>
              <li>Fecha y Lugar de nacimiento</li>
              <li>CURP, RFC</li>
              <li>Origen étnico*</li>
              <li>Fotografía</li>
              <li>Dirección (domicilio, ciudad, estado, país)</li>
              <li>Numero de Seguridad Social - IMSS</li>
              <li>Número telefónico fijo y celular</li>
              <li>Correo electrónico</li>
              <li>Estado civil</li>
              <li>Estado de salud*</li>
              <li>Discapacidad</li>
              <li>Firma, Ocupación, Escuela de procedencia</li>
              <li>
                Nombre del padre/madre/tutor de la persona aspirante y/o
                estudiante
              </li>
              <li>
                Datos de la persona que señale como primer contacto para
                reportar alguna emergencia (nombre, domicilio, teléfono).
              </li>
              <li>Datos personales obtenidos en las encuestas que aplique la universidad.</li>
              <li>Datos personales obtenidos a través de convocatorias a vacantes de empleo en la universidad.</li>
            </ul>
            <p className={styles.note}>* Datos personales sensibles.</p>
          </section>

          <section className={styles.section}>
            <h2>Fundamento legal y Transferencia de datos</h2>
            <p>
              El fundamento para el tratamiento y transferencia de datos personales
              son los artículos 3 fracción I, 34, 35, 36, 37, 39, 40, 42, así
              como lo dispuesto por el Título Tercero, Capítulo Primero de la
              Ley de Protección de Datos Personales en Posesión de Sujetos
              Obligados para el Estado de Guanajuato.
            </p>
            <p>
              Se le informa que sus datos personales podrán ser transmitidos a
              otras autoridades Federales, Estatales o Municipales, siempre y
              cuando éstos se utilicen para el ejercicio de facultades propias de
              las mismas, además de otras transmisiones, y a quienes tengan
              relación con el servicio público de la educación, así como de los
              servicios que brinda la universidad.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Derechos ARCO</h2>
            <p>
              Para el ejercicio de cualquiera de los derechos ARCO, usted podrá
              presentar solicitud por escrito ante la Unidad de Transparencia del
              Poder Ejecutivo, vía Plataforma Nacional de Transparencia
              disponible en{' '}
              <a
                href="http://www.plataformadetransparencia.org.mx/web/guest/inicio"
                target="_blank"
                rel="noreferrer"
              >
                www.plataformadetransparencia.org.mx
              </a>{' '}
              o por correo electrónico a{' '}
              <a href="mailto:unidadtransparencia@guanajuato.gob.mx">
                unidadtransparencia@guanajuato.gob.mx
              </a>
              .
            </p>
            <div className={styles.contactCard}>
              <h3>Datos de la Unidad de Transparencia</h3>
              <p><strong>Domicilio:</strong> Calle San Sebastián #78, Zona Centro, Guanajuato, Guanajuato, C.P. 36000.</p>
              <p><strong>Teléfono:</strong> (473) 6880470</p>
              <p><strong>Correo electrónico:</strong> unidadtransparencia@guanajuato.gob.mx</p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Cambios al aviso de privacidad</h2>
            <p>
              En caso de realizar alguna modificación al aviso de privacidad, se
              le hará de su conocimiento a través de la página web institucional
              de la Universidad Tecnológica del Norte de Guanajuato{' '}
              <a href="https://www.utng.edu.mx" target="_blank" rel="noreferrer">
                www.utng.edu.mx
              </a>
              , o bien, vía correo electrónico cuando se haya proporcionado o en
              las instalaciones de la Unidad de Transparencia.
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
