import { useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';

export function useGoogleSignIn(onSuccess) {
  const buttonRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response) => {
          try {
            const decoded = jwtDecode(response.credential);
            onSuccess({
              sub: decoded.sub,
              name: decoded.name,
              email: decoded.email,
              picture: decoded.picture
            });
          } catch (error) {
            console.error("Token decoding failed", error);
            // In a real app we might toast an error here.
          }
        }
      });
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'signin_with'
        });
      }
    };
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [onSuccess]);

  return buttonRef;
}
