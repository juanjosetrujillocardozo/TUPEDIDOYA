import { FRONT_URL } from './../../constants/constants.js';

export const fetchRequest = async (onErrorResponse = null, onErrorCatch, URL, method = 'GET', body = null, autenticacionRequerida = true, reporte = false, subirImagen = false) => {

  try {
    const dataRequest = {
      method,
      headers: {
        'accept': 'application/json; charset=utf-8',
        'content-type': 'application/json; charset=utf-8',
        'authorization': `bearer ${localStorage.getItem('JWT')}`,
      },
    };

    if (body)
      dataRequest.body = JSON.stringify(body);
    
    if (subirImagen) {
      delete dataRequest.headers['content-type'];
      dataRequest.body = body;
    }

    const res = await fetch(URL, dataRequest);

    let response;

    if (!reporte) {
      response = await res.json();
    } else {
      // Extraer el tipo de contenido y crear un Blob
      const contentType = res.headers.get('content-type');

      const { blob, contentType2 } = await res.blob().then(blob => ({ blob, contentType }));

      const url = window.URL.createObjectURL(blob);

      // Crear un enlace (link) y simular un clic para descargar el archivo
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nombre_del_archivo.xlsx';
      document.body.appendChild(a);
      a.click();

      // Liberar el objeto URL y remover el enlace creado
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);


      return;
    }

    if (res.ok) {
      return response;
    } else {
      if (res.status == 401 && autenticacionRequerida) {
        location.href = `${FRONT_URL}/src/html/login.html`;
      } else {
        console.log(response);
        if (res.status === 400 && response.hasOwnProperty("attributeExist"))
          response.message = `El ${response.attributeExist.key} ya está en uso.`;

        if (onErrorResponse) onErrorResponse(res, response);
      }
    }
  } catch (e) {
    onErrorCatch(e);
  }
};