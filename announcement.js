/* =========================================================
   CONFIG: OGŁOSZENIE / POSTER ADMINA
   Search for: CONFIG: OGŁOSZENIE

   Ten plik tworzy kartę ogłoszenia na stronie głównej.
   Treść edytujesz w: data/announcement.json
   Nie ma daty wygaśnięcia — active:true pokazuje ogłoszenie,
   active:false je ukrywa.
   ========================================================= */

(function(){
  const STYLE_ID='dw-announcement-styles';

  function addStyles(){
    if(document.getElementById(STYLE_ID)) return;

    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .announcement{
        display:none;
        margin-top:12px;
        border-radius:24px;
        overflow:hidden;
        background:linear-gradient(135deg,#201d17,#121212 72%);
        border:1px solid rgba(216,189,132,.20);
        box-shadow:var(--shadow);
      }
      .announcement.show{display:block}
      .announcement-image-wrap{
        display:none;
        width:100%;
        background:#0d0d0d;
        border-bottom:1px solid rgba(216,189,132,.12);
      }
      .announcement-image-wrap.show{display:block}
      .announcement-image{
        display:block;
        width:100%;
        height:auto;
        max-height:620px;
        object-fit:contain;
        background:#0d0d0d;
      }
      .announcement-copy{padding:18px 19px}
      .announcement-kicker{
        color:var(--gold);
        font-size:10px;
        letter-spacing:.17em;
        text-transform:uppercase;
        font-weight:900;
        margin-bottom:7px;
      }
      .announcement h3{
        margin:0;
        font-family:Georgia,serif;
        font-size:21px;
        line-height:1.2;
      }
      .announcement-message{
        margin:9px 0 0;
        color:#c8c2b7;
        font-size:12px;
        line-height:1.55;
        white-space:pre-line;
      }
      .announcement-link{
        display:none;
        margin-top:14px;
        width:100%;
        text-decoration:none;
        text-align:center;
        border-radius:14px;
        padding:11px 13px;
        background:var(--gold);
        color:#17120a;
        font-weight:900;
        font-size:12px;
      }
      .announcement-link.show{display:block}
    `;
    document.head.appendChild(style);
  }

  function createCard(){
    let card=document.getElementById('announcementCard');
    if(card) return card;

    const hero=document.querySelector('#home .hero');
    if(!hero) return null;

    card=document.createElement('article');
    card.className='announcement';
    card.id='announcementCard';
    card.innerHTML=`
      <div class="announcement-image-wrap" id="announcementImageWrap">
        <img class="announcement-image" id="announcementImage" alt="">
      </div>
      <div class="announcement-copy">
        <div class="announcement-kicker">Ogłoszenie</div>
        <h3 id="announcementTitle"></h3>
        <p class="announcement-message" id="announcementMessage"></p>
        <a class="announcement-link" id="announcementLink" target="_blank" rel="noopener noreferrer"></a>
      </div>
    `;

    hero.insertAdjacentElement('afterend',card);
    return card;
  }

  async function loadAnnouncement(){
    addStyles();
    const card=createCard();
    if(!card) return;

    try{
      const response=await fetch(
        './data/announcement.json?refresh='+Date.now(),
        {cache:'no-store'}
      );

      if(!response.ok) throw new Error('Announcement HTTP '+response.status);

      const announcement=await response.json();

      if(!announcement || announcement.active !== true){
        card.classList.remove('show');
        return;
      }

      const title=String(announcement.title||'').trim();
      const message=String(announcement.message||'').trim();
      const image=String(announcement.image||'').trim();
      const imageAlt=String(announcement.imageAlt||title||'Ogłoszenie').trim();
      const link=String(announcement.link||'').trim();
      const linkText=String(announcement.linkText||'Zobacz więcej').trim();

      if(!title && !message && !image){
        card.classList.remove('show');
        return;
      }

      const titleEl=document.getElementById('announcementTitle');
      titleEl.textContent=title;
      titleEl.style.display=title?'block':'none';

      const messageEl=document.getElementById('announcementMessage');
      messageEl.textContent=message;
      messageEl.style.display=message?'block':'none';

      const imageWrap=document.getElementById('announcementImageWrap');
      const imageEl=document.getElementById('announcementImage');
      if(image){
        imageEl.src=image;
        imageEl.alt=imageAlt;
        imageWrap.classList.add('show');
      }else{
        imageEl.removeAttribute('src');
        imageEl.alt='';
        imageWrap.classList.remove('show');
      }

      const linkEl=document.getElementById('announcementLink');
      if(link){
        linkEl.href=link;
        linkEl.textContent=linkText;
        linkEl.classList.add('show');
      }else{
        linkEl.removeAttribute('href');
        linkEl.textContent='';
        linkEl.classList.remove('show');
      }

      card.classList.add('show');
    }catch(error){
      console.warn('Nie udało się pobrać ogłoszenia:',error);
      card.classList.remove('show');
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',loadAnnouncement,{once:true});
  }else{
    loadAnnouncement();
  }
})();
