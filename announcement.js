/* =========================================================
   CONFIG: OGŁOSZENIE / POSTER ADMINA
   Search for: CONFIG: OGŁOSZENIE

   Ten plik tworzy kartę ogłoszenia na stronie głównej.
   Treść edytujesz w: data/announcement.json
   Nie ma daty wygaśnięcia — active:true pokazuje ogłoszenie,
   active:false je ukrywa.

   Karta jest domyślnie zwinięta. Kliknięcie nagłówka ją rozwija.
   Po rozwinięciu kolejność jest: tekst -> plakat -> opcjonalny link.
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

      .announcement-toggle{
        width:100%;
        border:0;
        background:transparent;
        color:var(--cream);
        padding:18px 19px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:14px;
        text-align:left;
      }
      .announcement-toggle-copy{
        min-width:0;
        flex:1;
      }
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
      .announcement-chevron{
        flex:0 0 auto;
        color:var(--gold);
        font-size:18px;
        line-height:1;
        transform:rotate(-90deg);
        transition:transform .18s ease;
      }
      .announcement.expanded .announcement-chevron{
        transform:rotate(0deg);
      }

      .announcement-body{
        display:none;
        border-top:1px solid rgba(216,189,132,.10);
      }
      .announcement.expanded .announcement-body{
        display:block;
      }
      .announcement-text{
        padding:15px 19px 17px;
      }
      .announcement-message{
        margin:0;
        color:#c8c2b7;
        font-size:12px;
        line-height:1.55;
        white-space:pre-line;
      }

      /* Poster jest celowo POD tekstem ogłoszenia. */
      .announcement-image-wrap{
        display:none;
        width:100%;
        background:#0d0d0d;
        border-top:1px solid rgba(216,189,132,.12);
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

      .announcement-link-wrap{
        display:none;
        padding:14px 19px 18px;
        border-top:1px solid rgba(216,189,132,.10);
      }
      .announcement-link-wrap.show{display:block}
      .announcement-link{
        display:block;
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
      <button type="button" class="announcement-toggle" id="announcementToggle" aria-expanded="false" aria-controls="announcementBody">
        <span class="announcement-toggle-copy">
          <span class="announcement-kicker">Ogłoszenie</span>
          <h3 id="announcementTitle"></h3>
        </span>
        <span class="announcement-chevron" aria-hidden="true">⌄</span>
      </button>

      <div class="announcement-body" id="announcementBody">
        <div class="announcement-text" id="announcementTextWrap">
          <p class="announcement-message" id="announcementMessage"></p>
        </div>

        <div class="announcement-image-wrap" id="announcementImageWrap">
          <img class="announcement-image" id="announcementImage" alt="">
        </div>

        <div class="announcement-link-wrap" id="announcementLinkWrap">
          <a class="announcement-link" id="announcementLink" target="_blank" rel="noopener noreferrer"></a>
        </div>
      </div>
    `;

    hero.insertAdjacentElement('afterend',card);

    const toggle=card.querySelector('#announcementToggle');
    toggle.addEventListener('click',()=>{
      const expanded=card.classList.toggle('expanded');
      toggle.setAttribute('aria-expanded',String(expanded));
    });

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
        card.classList.remove('show','expanded');
        return;
      }

      const title=String(announcement.title||'').trim();
      const message=String(announcement.message||'').trim();
      const image=String(announcement.image||'').trim();
      const imageAlt=String(announcement.imageAlt||title||'Ogłoszenie').trim();
      const link=String(announcement.link||'').trim();
      const linkText=String(announcement.linkText||'Zobacz więcej').trim();

      if(!title && !message && !image){
        card.classList.remove('show','expanded');
        return;
      }

      const titleEl=document.getElementById('announcementTitle');
      titleEl.textContent=title || 'Ogłoszenie';

      const messageEl=document.getElementById('announcementMessage');
      const textWrap=document.getElementById('announcementTextWrap');
      messageEl.textContent=message;
      textWrap.style.display=message?'block':'none';

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

      const linkWrap=document.getElementById('announcementLinkWrap');
      const linkEl=document.getElementById('announcementLink');
      if(link){
        linkEl.href=link;
        linkEl.textContent=linkText;
        linkWrap.classList.add('show');
      }else{
        linkEl.removeAttribute('href');
        linkEl.textContent='';
        linkWrap.classList.remove('show');
      }

      /* Każde świeżo wczytane ogłoszenie zaczyna zwinięte. */
      card.classList.remove('expanded');
      const toggle=document.getElementById('announcementToggle');
      if(toggle) toggle.setAttribute('aria-expanded','false');

      card.classList.add('show');
    }catch(error){
      console.warn('Nie udało się pobrać ogłoszenia:',error);
      card.classList.remove('show','expanded');
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',loadAnnouncement,{once:true});
  }else{
    loadAnnouncement();
  }
})();
