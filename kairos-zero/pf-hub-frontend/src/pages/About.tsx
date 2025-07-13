import React, { useState } from 'react';
import { newsletterService } from '../services/newsletterService';

const About: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [subscribeError, setSubscribeError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    setSubscribeMessage('');
    setSubscribeError('');

    try {
      await newsletterService.subscribe(email);
      setSubscribeMessage('Subscription successful! You will receive our updates soon.');
      setEmail('');
    } catch (error) {
      setSubscribeError(error instanceof Error ? error.message : 'Error during subscription');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      color: 'var(--color-text)',
      lineHeight: '1.6'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '4rem',
        padding: '2rem 0'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          ABOUT PEAKFLOW
        </h1>
      </div>

      {/* Our Mission */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          color: 'var(--color-text)'
        }}>
          Our mission
        </h2>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          At PeakFlow, we are dedicated to revolutionizing running performance through cutting-edge technology and data science. Our mission is to provide runners of all levels with sophisticated tools that were once only available to serious athletes.
        </p>
        <p style={{
          fontSize: '1.1rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          The first model of Kairos collection, Kairos Zero, represents our first major step in this journey - a precision tool designed to optimize pacing strategies for maximum performance during races.
        </p>
      </section>

      {/* The Technology */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          color: 'var(--color-text)'
        }}>
          The technology
        </h2>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          PeakFlow's core technology is based on a revolutionary mathematical model derived from the minimal power theory for human performance. The model, developed from research published in this scientific paper, analyzes the relationship between metabolic power and running speed.
        </p>
        <p style={{
          fontSize: '1.1rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          Our system combines advanced algorithms for power analysis, GPX data processing, weather prediction, and personal records analysis. Using machine learning techniques, we continuously optimize our predictions based on user feedback and performance data.
        </p>
      </section>

      {/* Stay Updated */}
      <section style={{
        marginBottom: '4rem',
        padding: '2rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '15px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          color: 'var(--color-text)'
        }}>
          Stay Updated
        </h2>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '2rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          Subscribe to our newsletter to receive updates about new features, improvements, and the latest developments in running technology.
        </p>
        
        <form onSubmit={handleSubscribe} style={{ marginBottom: '1rem' }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={isSubscribing}
              style={{
                flex: '1',
                minWidth: '250px',
                padding: '0.75rem 1rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--color-text)',
                fontSize: '1rem',
                fontFamily: 'Arial, Helvetica, sans-serif',
                opacity: isSubscribing ? 0.6 : 1
              }}
            />
            <button
              type="submit"
              disabled={isSubscribing}
              style={{
                padding: '0.75rem 2rem',
                background: isSubscribing 
                  ? 'rgba(102, 126, 234, 0.6)' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isSubscribing ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s ease',
                fontFamily: 'Arial, Helvetica, sans-serif',
                opacity: isSubscribing ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isSubscribing) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isSubscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
        </form>
        
        {subscribeMessage && (
          <div style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            background: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: '8px',
            color: '#4CAF50',
            fontFamily: 'Arial, Helvetica, sans-serif'
          }}>
            {subscribeMessage}
          </div>
        )}
        
        {subscribeError && (
          <div style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            background: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            borderRadius: '8px',
            color: '#F44336',
            fontFamily: 'Arial, Helvetica, sans-serif'
          }}>
            {subscribeError}
          </div>
        )}
        
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--color-text-secondary)',
          fontStyle: 'italic',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          We respect your privacy and will never share your email with third parties.
        </p>
      </section>

      {/* Contact Us */}
      <section style={{
        padding: '2rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '15px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          color: 'var(--color-text)'
        }}>
          Contact Us
        </h2>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          We're always looking to improve and expand our tools. If you have feedback, questions, or ideas, please reach out to us at{' '}
          <a 
            href="mailto:peakflow.corp@gmail.com"
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: '600',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            peakflow.corp@gmail.com
          </a>.
        </p>
        <p style={{
          fontSize: '1.1rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          We're constantly refining our models based on performance data and feedback from our user community to ensure the most accurate and useful predictions possible.
        </p>
      </section>
    </div>
  );
};

export default About; 