import { FiLinkedin, FiGithub, FiUser } from 'react-icons/fi';

const DeveloperCard = ({
  name,
  role,
  image,
  alt,
  portfolioUrl,
  linkedinUrl,
  githubUrl,
  cardColor = '#EFB8C8'
}) => {
  return (
    <>
      {/* CSS Styles */}
      <style jsx>{`
        .developer-card {
          --w-card: 340px;
          --h-card: 260px;
          --p-card: 32px;
          --sz-action: 36px;
          --round-card: 20px;
          
          width: var(--w-card);
          height: var(--h-card);
          border-radius: var(--round-card);
          position: relative;
          background: linear-gradient(135deg, ${cardColor}f0 0%, ${cardColor}e0 100%);
          padding: var(--p-card);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.12),
            0 2px 8px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(20px);
        }

        .developer-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.15),
            0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .social-links {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 18px;
        }

        .social-link {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .social-link:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .boxes {
          --sz-img: 52px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 14px;
          margin-bottom: 20px;
        }

        .boxes .caption {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .boxes .name {
          font-size: 18px;
          font-weight: 700;
          line-height: 1.2;
          color: white;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          margin: 0;
          text-align: center;
        }

        .boxes .as {
          font-size: 13px;
          font-weight: 500;
          line-height: 1.3;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          margin: 0;
          text-align: center;
        }



        .box-foot {
          --sz-img: 36px;
          position: relative;
          z-index: 9;
          width: 100%;
          display: flex;
          align-items: center;
          flex-direction: row;
          justify-content: space-between;
        }

        .box-foot::before {
          content: attr(data-title);
          position: absolute;
          bottom: calc(100% + 4px);
          color: rgba(255, 255, 255, 0.7);
          min-width: max-content;
          font-size: 14px;
        }

        .box-foot-figure {
          font-weight: 400;
          outline: 1px solid rgba(255, 255, 255, 0.3);
          width: max-content;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          flex-direction: row;
          position: relative;
          z-index: 1;
          gap: 0.5rem;
          padding: 0.5rem;
          overflow: hidden;
          color: white;
        }

        .box-foot-figure .img {
          transition: all 0.25s ease;
          position: relative;
          z-index: 1;
        }

        .box-foot-figure a {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          cursor: pointer;
          outline: none;
          border: none;
          background: none transparent;
          transition: all 0.25s ease;
          color: white;
          text-decoration: none;
        }

        .box-foot-figure a svg {
          transition: all 0.25s ease;
          transform: rotate(45deg);
        }

        .box-foot-figure .img:hover {
          transform: scale(1.2);
        }

        .box-foot-figure .img:hover ~ a svg,
        .box-foot-figure a:hover svg {
          transform: scale(1.25) rotate(0);
        }

        .box-foot-actions {
          --sz-toggle: 36px;
          gap: 8px;
          display: grid;
          grid-auto-flow: column;
        }

        .box-foot-action {
          cursor: pointer;
          border-radius: 9999px;
          border: none;
          outline: none;
          display: flex;
          align-items: center;
          justify-content: center;
          height: var(--sz-toggle);
          min-height: var(--sz-toggle);
          max-height: var(--sz-toggle);
          width: var(--sz-toggle);
          min-width: var(--sz-toggle);
          max-width: var(--sz-toggle);
          transition: all 0.5s ease;
          color: rgba(255, 255, 255, 0.75);
          background-color: rgba(255, 255, 255, 0.1);
          text-decoration: none;
        }

        .box-foot-action:hover {
          color: white;
          background-color: rgba(255, 255, 255, 0.2);
        }

        .img {
          width: var(--sz-img);
          height: var(--sz-img);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .img:hover {
          transform: scale(1.05);
        }

        .font-medium {
          font-weight: 500;
        }

        .font-semibold {
          font-weight: 600;
        }

        .text-xs {
          font-size: 12px;
        }

        .text-sm {
          font-size: 14px;
        }
      `}</style>

      <div className="developer-card">


        <figure className="boxes">
          <span className="img">
            <img
              src={image}
              alt={alt}
              className="w-full h-full object-cover"
            />
          </span>
          <figcaption className="caption">
            <p className="name">{name}</p>
            <span className="as" title={role}>{role}</span>
          </figcaption>
        </figure>

        {/* Social Links */}
        <div className="social-links">
          <a
            href={portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            <FiUser size={16} />
          </a>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            <FiGithub size={16} />
          </a>
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            <FiLinkedin size={16} />
          </a>
        </div>


      </div>
    </>
  );
};

export default DeveloperCard;