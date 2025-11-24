import React from 'react';
import '../Landing.css'; // Import styles to ensure they apply

export const OrigenSection = () => {
  return (
    <section id="origen" className="origen-section">
      <div className="container">
        <h2 className="section-title">Nuestro Origen</h2>
        <p className="section-intro">
          Amaranta Cigars nace de la pasión por el arte ancestral de los buenos tabacos. Fundada en el corazón de las tierras más fértiles para el cultivo del tabaco, nuestra marca representa la herencia, el conocimiento y la dedicación de generaciones de maestros torcedores.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌿</div>
            <h3>Nuestra Herencia</h3>
            <p>
              Desde 2020, hemos preservado las técnicas tradicionales de cultivo y secado, combinándolas con innovaciones modernas que respetan la esencia del auténtico puro. Cada hoja es seleccionada manualmente tras un riguroso proceso de curación natural.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👐</div>
            <h3>El Arte del Torcido</h3>
            <p>
              Nuestros maestros torcedores, con más de 20 años de experiencia, dan forma a cada cigarro con paciencia y precisión. Este proceso artesanal garantiza un tiro perfecto y una combustión uniforme en cada una de nuestras vitolas.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>Filosofía Amaranta</h3>
            <p>
              Creemos que un buen cigarro no es solo un producto, es una experiencia. Una tradición que se comparte, un momento de reflexión y placer que conecta a los conocedores con la esencia más pura del tabaco.
            </p>
          </div>
        </div>

        <div className="quote-container">
          <blockquote>
            "Cada Amaranta es una promesa de excelencia, un tributo a la tradición tabacalera"
          </blockquote>
          <cite>- Familia Rodríguez, Fundadores</cite>
        </div>
      </div>
    </section>
  );
};

export const ExperienciaSection = () => {
  return (
    <section id="experiencia" className="experiencia-section">
      <div className="container">
        <h2 className="section-title">La Experiencia Amaranta</h2>
        <p className="section-intro">
          Sumérgete en el arte del tabaco premium a través de una tradición que honra los sentidos y celebra el tiempo pausado.
        </p>

        <div className="experience-grid">
          <div className="experience-card">
            <h3>El Ritual del Aroma</h3>
            <p>
              Cada Amaranta libera una sinfonía de aromas que evolucionan con cada calada. Notas de madera noble, toques de nuez y un final especiado que perdura en el paladar, creando una experiencia olfativa única.
            </p>
          </div>

          <div className="experience-card">
            <h3>Sabores que Perduran</h3>
            <p>
              La complejidad de nuestros blends ofrece un viaje gustativo que comienza suave, se intensifica en el desarrollo y concluye con un retrogusto elegante. Un diálogo entre fuerza y sutileza en cada vitola.
            </p>
          </div>

          <div className="experience-card">
            <h3>Combustión Perfecta</h3>
            <p>
              Gracias al torcido artesanal, cada cigarro mantiene una combustión uniforme y lenta, permitiendo disfrutar de la experiencia durante el tiempo perfecto. La ceniza compacta y grisácea es testimonio de calidad.
            </p>
          </div>

          <div className="experience-card">
            <h3>Tiempo y Paciencia</h3>
            <p>
              Un Amaranta no se fuma, se saborea. Es una invitación a detener el tiempo, a disfrutar del momento presente y a convertir una simple pausa en una experiencia contemplativa y enriquecedora.
            </p>
          </div>

          <div className="experience-card">
            <h3>Ingredientes Naturales</h3>
            <p>
              Utilizamos exclusivamente hojas de tabaco de primera calidad, sin aditivos ni acelerantes. La pureza de nuestros ingredientes garantiza una experiencia auténtica y libre de artificios.
            </p>
          </div>

          <div className="experience-card">
            <h3>Arte en Cada Detalle</h3>
            <p>
              Desde la selección de la capa hasta el anillado final, cada elemento es cuidadosamente considerado. La estética de nuestros puros refleja la elegancia y sofisticación que definen la marca.
            </p>
          </div>
        </div>

        <div className="quote-container alt">
          <blockquote>
            "La verdadera experiencia Amaranta trasciende el humo: es un encuentro con la tradición, los sentidos y el arte del buen vivir"
          </blockquote>
          <cite>- Filosofía de la Casa Amaranta</cite>
        </div>
      </div>
    </section>
  );
};
