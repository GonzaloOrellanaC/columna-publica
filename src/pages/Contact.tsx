import React from 'react';
import { Link } from 'react-router-dom';

export default function Contact() {
  return (
    <div className="contact-container">
      <Link to="/" className="btn-back">Volver a la página principal</Link>
      <div className="contact-card">
        <h1 className="contact-title">Únete a Columna Pública</h1>
        <p className="contact-text">
          ¿Deseas formar parte de nuestro ecosistema editorial y contribuir al debate público? 
          Actualmente no contamos con un formulario de registro automático para garantizar la calidad y coherencia de nuestro repositorio.
        </p>
        <p className="contact-text">
          Envíanos tu solicitud de acceso directamente a nuestro equipo editorial:
        </p>
        
        <a href="mailto:editorial@ecoglocalmedia.com" className="contact-email">
          editorial@ecoglocalmedia.com
        </a>

        <div className="contact-requirements">
          <h4>Requisitos para la solicitud:</h4>
          <ul>
            <li>Nombre completo</li>
            <li>Currículum Vitae (CV) actualizado</li>
            <li>Especialidad o temáticas de las columnas que deseas publicar</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
