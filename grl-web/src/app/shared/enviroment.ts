// export const environment = {
//     production: true,
//     api: {
//       url: 'https://ratracobeexcel-production.up.railway.app' // Thay thế bằng URL production thực tế
//     }
//   };
export const environment = {
    production: true,
    api: {
      url: 'https://beexcelgreenline.onrender.com/api',
      // url: 'http://localhost:3000/api',
      // url: 'https://nrgreenlines.com.vn/api',

      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      } 
    }
  };