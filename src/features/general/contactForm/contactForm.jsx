import React, { useState } from 'react';
import emailjs from 'emailjs-com';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        asunto: '',
        mensaje: ''
    });
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);
        setMessage('');

        try {
            const templateParams = {
                from_name: formData.nombre,
                from_email: formData.email,
                subject: formData.asunto,
                message: formData.mensaje,
                to_name: 'Amaranta Soft'
            };

            await emailjs.send(
                'service_16ae59n',
                'template_v7nh8la',
                templateParams,
                'SgrdM61URZAZ5ePLJ'
            );

            setMessage('¡Mensaje enviado correctamente! Te contactaremos pronto.');
            setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });

        } catch (error) {
            setMessage('Error al enviar. Por favor, intenta nuevamente.');
            console.error('Error:', error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="contact-form-container">
            {message && (
                <div className={message.includes('Error') ? 'mensaje-error' : 'mensaje-exito'}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group-contacto">
                    <label htmlFor="nombre">Nombre</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        placeholder="Tu nombre"
                    />
                </div>

                <div className="form-group-contacto">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="tu@email.com"
                    />
                </div>

                <div className="form-group-contacto">
                    <label htmlFor="asunto">Asunto</label>
                    <input
                        type="text"
                        id="asunto"
                        name="asunto"
                        value={formData.asunto}
                        onChange={handleChange}
                        required
                        placeholder="Asunto del mensaje"
                    />
                </div>

                <div className="form-group-contacto">
                    <label htmlFor="mensaje">Mensaje</label>
                    <textarea
                        id="mensaje"
                        name="mensaje"
                        value={formData.mensaje}
                        onChange={handleChange}
                        required
                        placeholder="Escribe tu mensaje aquí..."
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className="btn-enviar-contacto"
                    disabled={isSending}
                >
                    {isSending ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
            </form>
        </div>
    );
};

export default ContactForm;