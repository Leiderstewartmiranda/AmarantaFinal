import Swal from 'sweetalert2';

export const sendAutoResponse = async (userEmail, userName, requestTitle) => {
  try {
    const response = await fetch('http://localhost:5201/api/Email/send-auto-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: userEmail,
        name: userName,
        title: requestTitle,
        company: 'Amaranta'
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar confirmación');
    }

    return await response.json();
  } catch (error) {
    console.error('Error enviando respuesta automática:', error);
    // No mostrar error al usuario, es solo para confirmación
  }
};