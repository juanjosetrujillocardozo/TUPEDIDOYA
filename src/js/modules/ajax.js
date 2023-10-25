export const fetchRequest = async (onErrorResponse = null, onErrorCatch, URL, method = 'GET', body = null) => {

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

    const res = await fetch(URL, dataRequest);
    const response = await res.json();

    if (res.ok) {
      return response;
    } else {
      if (res.status == 401) {
        location.href = "http://127.0.0.1:5500/src/html/login.html";
      } else {
        console.log(res);
        if (onErrorResponse) onErrorResponse(res, response);
      }
    }
  } catch (e) {
    onErrorCatch(e);
  }
};