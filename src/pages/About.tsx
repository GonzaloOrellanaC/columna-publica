import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" className="btn-back">
          &larr; Volver a la página principal
        </Link>
      </div>
      <h1 className="section-title">Quiénes Somos</h1>
      <div className="detail-content" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#cbd5e0' }}>
        <p style={{ marginBottom: '1.5rem' }}>
          <strong>Columna Pública</strong> es un espacio digital dedicado a la libre expresión, el debate de ideas y la difusión de opiniones fundamentadas. Nacimos con la convicción de que una sociedad informada y crítica se construye a través del diálogo abierto y el intercambio de perspectivas diversas.
        </p>
        <p style={{ marginBottom: '1.5rem' }}>
          Nuestra plataforma reúne a expertos, profesionales y pensadores de diversos campos para ofrecer análisis profundos sobre los temas que marcan la agenda pública. Creemos en el valor de la palabra escrita como herramienta para reflexionar, cuestionar y proponer soluciones a los desafíos contemporáneos.
        </p>
        <p style={{ marginBottom: '1.5rem' }}>
          En <strong>Columna Pública</strong>, no imponemos una línea editorial única. Por el contrario, celebramos la pluralidad de voces y fomentamos un entorno donde el respeto y la argumentación sólida son los pilares fundamentales. Cada columnista es responsable de sus opiniones, enriqueciendo así el mosaico de ideas que ofrecemos a nuestros lectores.
        </p>
        <p>
          Si eres un experto en tu área y deseas contribuir a este espacio de debate, te invitamos a ponerte en contacto con nosotros a través de nuestra sección de <Link to="/contact" style={{ color: '#5b9bd5', textDecoration: 'underline' }}>Contacto</Link>.
        </p>
      </div>
    </div>
  );
}
