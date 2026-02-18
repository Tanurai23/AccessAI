const checkoutPro = async () => {
  const response = await fetch('https://your-stripe-endpoint/create-checkout', {
    method: 'POST',
    body: JSON.stringify({ 
      success_url: 'https://accessai.co/success',
      cancel_url: 'https://accessai.co/cancel'
    })
  });
  
  const { url } = await response.json();
  window.open(url, '_blank');
};