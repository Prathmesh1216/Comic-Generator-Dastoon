
//// part 4 with image annotation 
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [comicText, setComicText] = useState(Array(10).fill(''));
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [annotations, setAnnotations] = useState(Array(10).fill(''));

  const getRandomImage = async () => {
    try {
      const response = await fetch('https://api.unsplash.com/photos/random?query=anime', {
        headers: {
          Authorization: 'Client-ID XclTCyYDjN2eRu0wTgElXyyPU6l2ilvRnPFCvQ82VQg', // Replace with your Unsplash API key
        },
      });
  
      const data = await response.json();
  
      console.log('API Response:', data);  // Log the API response
  
      if (data.urls && data.urls.regular) {
        return data.urls.regular;
      } else {
        console.error('Empty or unexpected API response:', data);
        return null;
      }
    } catch (error) {
      console.error('Error fetching image from Unsplash:', error.message);
      return null;
    }
  };
  
  

  useEffect(() => {
    const setBackgroundImage = async () => {
      try {
        const imageUrl = await getRandomImage();
        if (imageUrl) {
          document.body.style.backgroundImage = `url("${imageUrl}")`;
        } else {
          console.error('Received empty image URL');
        }
      } catch (error) {
        console.error('Error setting background image:', error.message);
      }
    };
  
    // Set a random background image when the component is mounted
    setBackgroundImage();
  
    // Clear the background image when the component is unmounted
    return () => {
      document.body.style.backgroundImage = 'none';
    };
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Call function to handle API integration and display comic panels
    await handleAPIIntegration(comicText);

    setLoading(false);
  };

  const handleAPIIntegration = async (comicText) => {
    try {
      const apiUrl = "https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud";

      const images = await Promise.all(
        comicText.map(async (text) => {
          const response = await fetch(apiUrl, {
            headers: {
              "Accept": "image/png",
              "Authorization": "Bearer VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM",
              "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({ "inputs": text }),
          });

          const blob = await response.blob();
          return URL.createObjectURL(blob);
        })
      );

      setGeneratedImages(images);
    } catch (error) {
      console.error('Error during API integration:', error.message);
      // console.log('Error during API integration:', error.message);
    }
  };

  const handleAnnotationChange = (index, text) => {
    setAnnotations((prevAnnotations) => {
      const newAnnotations = [...prevAnnotations];
      newAnnotations[index] = text;
      return newAnnotations;
    });
  };

  return (
    <div className="App">
      <header>
        <h1>Comic Generator</h1>
      </header>
      <form onSubmit={handleSubmit}>
        {comicText.map((text, index) => (
          <div key={index} className="input-container">
            <input
              type="text"
              placeholder={`Panel ${index + 1}`}
              value={text}
              onChange={(e) => {
                const newText = e.target.value;
                setComicText((prevText) =>
                  prevText.map((item, i) => (i === index ? newText : item))
                );
              }}
            />
            <input
              type="text"
              placeholder={`Annotation ${index + 1}`}
              value={annotations[index]}
              onChange={(e) => {
                const newText = e.target.value;
                handleAnnotationChange(index, newText);
              }}
            />
          </div>
        ))}
        <button type="submit">Generate Panels</button>
      </form>
      <div id="comic-wrapper">
  <div id="comicDisplay">
    {loading && <div className="loading-spinner"></div>}

    {generatedImages.map((imageUrl, index) => (
      <div key={index} className="comic-panel">
        <img src={imageUrl} alt={`Comic Panel ${index + 1}`} />
        <div className="annotation">{annotations[index]}</div>
      </div>
    ))}
  </div>

  {generatedImages.length > 0 && (
    <div className="generate-another-comic-container">
      <button
        className="generate-another-comic-btn"
        onClick={() => {
          setComicText(Array(10).fill("")); // Clear the input fields
          setGeneratedImages([]); // Clear the generated images
          setAnnotations(Array(10).fill("")); // Clear the annotations
        }}
      >
        Generate more panels
      </button>
    </div>
  )}
</div>

      
    </div>
  );
}

export default App;

