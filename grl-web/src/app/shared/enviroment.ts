// export const environment = {
//     production: true,
//     api: {
//       url: 'https://ratracobeexcel-production.up.railway.app' // Thay thế bằng URL production thực tế
//     }
//   };
export const environment = {
    production: true,
    api: {
      url: 'http://beexcelgreenline.onrender.com/api',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      } 
    }
  };