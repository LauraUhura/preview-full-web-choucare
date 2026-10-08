/* Progressive enhancement: no data collection, dependency states remain explicit. */
(() => {
  const mobile=matchMedia('(max-width:768px)');
  document.addEventListener('DOMContentLoaded',()=>{
    if(!window.matchMedia('(max-width: 991px)').matches)return;
    const filters=[...document.querySelectorAll('.news-filter-sidebar details.news-filter')];
    filters.forEach((filter,index)=>{filter.open=index===0});
  });
  const menu=document.querySelector('.mobile-menu-toggle'), nav=document.querySelector('#primary-nav');
  document.documentElement.classList.add('mobile-menu-ready');
  const close=()=>{nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menú')};
  menu.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');if(open)nav.querySelector('a').focus()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();menu.focus()}});mobile.addEventListener('change',close);
  const foot=()=>document.querySelectorAll('.footer-group').forEach(e=>e.open=!mobile.matches);foot();mobile.addEventListener('change',foot);
  const current=location.pathname.split('/').pop();nav.querySelectorAll('a').forEach(a=>{if(a.getAttribute('href')===current)a.setAttribute('aria-current','page')});
  const notice=document.querySelector('#preview-notice');let trigger;
  document.querySelectorAll('[data-preview-target]').forEach(b=>b.addEventListener('click',()=>{trigger=b;document.querySelector('#preview-message').textContent=`El contenido de ${b.dataset.previewTarget} aún no está disponible.`;notice.hidden=false;document.querySelector('#preview-dismiss').focus()}));
  document.querySelector('#preview-dismiss').addEventListener('click',()=>{notice.hidden=true;trigger?.focus()});
  function tabs(attribute,panelAttribute,onSelect){
    const items=[...document.querySelectorAll(`[${attribute}]`)];if(!items.length)return;
    const panels=[...document.querySelectorAll(`[${panelAttribute}]`)];
    items.forEach((item,i)=>{item.id=`tab-${i}-${attribute}`;if(panels[i]){panels[i].id=`panel-${i}-${attribute}`;panels[i].setAttribute('role','tabpanel');panels[i].setAttribute('aria-labelledby',item.id);item.setAttribute('aria-controls',panels[i].id)}});
    function select(item,focus=false){
      const changed=items.some(b=>b!==item&&b.getAttribute('aria-selected')==='true');
      items.forEach(b=>{const active=b===item;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1});
      panels.forEach(p=>{const active=p.getAttribute(panelAttribute)===item.getAttribute(attribute);p.hidden=!active;p.classList.toggle('is-entering',attribute==='data-capability'&&active&&changed)});
      onSelect?.(item);if(focus)item.focus()
    }
    items.forEach((item,i)=>{item.addEventListener('click',()=>select(item));item.addEventListener('keydown',e=>{let n;if(['ArrowRight','ArrowDown'].includes(e.key))n=(i+1)%items.length;if(['ArrowLeft','ArrowUp'].includes(e.key))n=(i+items.length-1)%items.length;if(e.key==='Home')n=0;if(e.key==='End')n=items.length-1;if(n!==undefined){e.preventDefault();select(items[n],true)}})});select(items[0]);
  }
  function capabilityAccordionTabs(){
    const list=document.querySelector('.wf-capability-tabs'),host=document.querySelector('.wf-capability-panels');if(!list||!host||!list.querySelector('[data-capability]'))return;
    const items=[...list.querySelectorAll('[data-capability]')],panels=[...host.querySelectorAll('[data-capability-panel]')];
    const panelFor=key=>panels.find(panel=>panel.dataset.capabilityPanel===key);
    const itemFor=key=>list.querySelector(`[data-capability-item="${key}"]`);
    items.forEach((item,i)=>{const key=item.dataset.capability,panel=panelFor(key);item.id=`capability-tab-${key}`;item.setAttribute('aria-controls',panel.id||`capability-panel-${key}`);panel.id=item.getAttribute('aria-controls');panel.setAttribute('aria-labelledby',item.id)});
    let active=items.find(item=>item.getAttribute('aria-selected')==='true')?.dataset.capability||items[0]?.dataset.capability;
    function arrange(){
      const compact=mobile.matches;
      list.setAttribute('aria-label','Capacidades de pruebas de software');
      if(compact){list.removeAttribute('role');list.removeAttribute('aria-orientation')}
      else{list.setAttribute('role','tablist');list.setAttribute('aria-orientation','vertical')}
      panels.forEach(panel=>{
        const key=panel.dataset.capabilityPanel;
        if(compact){itemFor(key)?.append(panel);panel.setAttribute('role','region')}
        else{host.append(panel);panel.setAttribute('role','tabpanel')}
        panel.setAttribute('aria-labelledby',`capability-tab-${key}`);
      });
      if(!compact&&active===null)active=items[0]?.dataset.capability;
      render();
    }
    function render(changed=false){
      const compact=mobile.matches;
      items.forEach(item=>{
        const selected=item.dataset.capability===active;
        item.classList.toggle('active',selected);
        if(compact){item.removeAttribute('role');item.removeAttribute('aria-selected');item.setAttribute('aria-expanded',String(selected));item.removeAttribute('tabindex')}
        else{item.setAttribute('role','tab');item.setAttribute('aria-selected',String(selected));item.removeAttribute('aria-expanded');item.tabIndex=selected?0:-1}
      });
      panels.forEach(panel=>{const selected=panel.dataset.capabilityPanel===active;panel.hidden=!selected;panel.classList.toggle('is-entering',!compact&&selected&&changed)});
    }
    items.forEach((item,index)=>{
      item.addEventListener('click',()=>{const previous=active;active=mobile.matches&&active===item.dataset.capability?null:item.dataset.capability;render(previous!==active)});
      item.addEventListener('keydown',event=>{
        if(mobile.matches)return;
        let next;if(['ArrowRight','ArrowDown'].includes(event.key))next=(index+1)%items.length;if(['ArrowLeft','ArrowUp'].includes(event.key))next=(index+items.length-1)%items.length;if(event.key==='Home')next=0;if(event.key==='End')next=items.length-1;
        if(next!==undefined){event.preventDefault();active=items[next].dataset.capability;render(true);items[next].focus()}
      });
    });
    arrange();mobile.addEventListener('change',arrange);
  }
  capabilityAccordionTabs();tabs('data-contact-choice','data-contact-panel');
const industryContent = {
        'Banca': {
          challenges: ['Evolucionar al ritmo de nuevas tecnologías y expectativas de los clientes.', 'Garantizar servicios financieros ágiles, seguros y confiables en todos los canales.', 'Convertir los datos en conocimiento para anticipar riesgos y tomar mejores decisiones.'],
          proposition: 'Aseguramos la confiabilidad de los activos digitales del negocio financiero, combinando experiencia, conocimiento, método, tecnología, datos e IA. Ayudamos a acelerar soluciones, disminuir riesgos y mejorar la toma de decisiones, para que cada iniciativa digital cumpla su propósito y genere confianza en sus usuarios.',
          capabilities: ['Software Testing', 'Performance', 'Automatización'],
          evidence: 'Impulsando la adopción digital en la banca.',
          evidenceUrl: 'https://www.linkedin.com/pulse/caso-de-%25C3%25A9xito-impulsando-la-adopci%25C3%25B3n-digital-en-banca-9tn5e/?trackingId=Jun19IGVjHltUzE39ESj0Q%3D%3D'
        },
        'Seguros': {
          challenges: ['Evolucionar productos y servicios con tecnologías más eficientes.', 'Cumplir las exigencias regulatorias del sector.', 'Digitalizar servicios y optimizar procesos.', 'Construir experiencias más cercanas y ágiles para los usuarios.'],
          proposition: 'Combinamos experiencia, conocimiento del negocio y tecnología para reducir riesgos y asegurar la confiabilidad de los activos digitales, acompañando la evolución del sector y el cumplimiento regulatorio.',
          capabilities: ['Software Testing', 'Performance', 'Automatización'],
          evidence: '',
          evidenceUrl: ''
        },
        'Servicios financieros': {
          challenges: ['Evolucionar la tecnología para ofrecer servicios más eficientes.', 'Responder a usuarios que esperan experiencias digitales ágiles.', 'Asegurar transacciones móviles confiables.', 'Competir con nuevos modelos y servicios financieros digitales.'],
          proposition: 'Integramos capacidades especializadas para acelerar la evolución digital, disminuir riesgos y construir experiencias financieras confiables, poniendo al usuario y al negocio en el centro.',
          capabilities: ['Software Testing', 'Performance', 'Mobile Testing'],
          evidence: 'Impulsando la adopción digital en la banca.',
          evidenceUrl: 'https://www.linkedin.com/pulse/caso-de-%25C3%25A9xito-impulsando-la-adopci%25C3%25B3n-digital-en-banca-9tn5e/?trackingId=Jun19IGVjHltUzE39ESj0Q%3D%3D'
        },
        'Telecomunicaciones': {
          challenges: ['Evolucionar plataformas y servicios con mayor velocidad.', 'Responder a un ecosistema tecnológico cada vez más complejo.', 'Digitalizar y optimizar procesos.', 'Garantizar experiencias ágiles y confiables para los usuarios.'],
          proposition: 'Acompañamos la evolución de las telecomunicaciones con capacidades que permiten acelerar la transformación, anticipar riesgos y asegurar la confiabilidad de servicios y experiencias digitales.',
          capabilities: ['Software Testing', 'Performance', 'Automatización'],
          evidence: 'Impulsando una experiencia digital para 6M de usuarios.',
          evidenceUrl: 'https://www.linkedin.com/pulse/caso-de-%25C3%25A9xito-impulsando-una-experiencia-digital-para-8shwe/?trackingId=JEX32yWVwGLtDrVHKVIBwA%3D%3D'
        },
        'Retail': {
          challenges: ['Comprender nuevos comportamientos y hábitos de compra.', 'Construir experiencias omnicanal consistentes.', 'Responder a consumidores cada vez más conectados.', 'Fortalecer la relación digital entre clientes y marcas.'],
          proposition: 'Ayudamos al retail a construir experiencias digitales confiables y omnicanal, anticipando riesgos y acelerando la evolución de los activos digitales que conectan marcas, operaciones y consumidores.',
          capabilities: ['Software Testing', 'Performance', 'Mobile Testing'],
          evidence: 'Impulsando la adopción digital en la banca.',
          evidenceUrl: 'https://www.linkedin.com/pulse/caso-de-%25C3%25A9xito-impulsando-la-adopci%25C3%25B3n-digital-en-banca-9tn5e/?trackingId=Jun19IGVjHltUzE39ESj0Q%3D%3D'
        }
      };
  const story=document.querySelector('.wf-industry-story');
  const industryList=document.querySelector('.wf-industry-tabs');
  const industryPanelHost=document.querySelector('.wf-industry-panels');
  function updateIndustry(item){
    if(!story||!item)return;
    story.setAttribute('aria-labelledby',item.id);
    const key=item.dataset.industry,c=industryContent[key];
    const titleEl=document.querySelector('[data-industry-title]');
    if(titleEl) titleEl.textContent=key;
    const list=document.querySelector('[data-industry-challenges]');
    if(list) list.replaceChildren(...c.challenges.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));
    const propEl=document.querySelector('[data-industry-proposition]');
    if(propEl) propEl.textContent=c.proposition;
    const capList=document.querySelector('[data-industry-capabilities]');
    if(capList && c.capabilities){
      capList.replaceChildren(...c.capabilities.map(cap => {
        const span = document.createElement('span');
        span.className = 'industry-pill';
        span.textContent = cap;
        return span;
      }));
    }
    const evText=document.querySelector('[data-industry-evidence]');
    if(evText){evText.textContent=c.evidence;evText.hidden=!c.evidence}
    const evWrap=document.querySelector('[data-industry-evidence-wrap]');
    if(evWrap) evWrap.hidden=false;
    const evLabel=document.querySelector('[data-industry-evidence-label]');
    if(evLabel) evLabel.hidden=!c.evidence;
    const link=document.querySelector('[data-industry-evidence-link]');
    if(link){
      link.href=c.evidenceUrl;
      link.hidden=!c.evidenceUrl;
      link.innerHTML=`Ver caso de éxito <span aria-hidden="true">↗</span>`;
    }
    const cta=document.querySelector('[data-industry-cta]');
    if(cta){
      cta.innerHTML=`Hablar con un especialista en ${key} <span aria-hidden="true">↓</span>`;
      cta.setAttribute('data-interest', `Industria: ${key}`);
    }
  }
  function industryAccordionTabs(){
    if(!story||!industryList||!industryPanelHost)return;
    const items=[...industryList.querySelectorAll('[data-industry]')];
    let active=items.find(item=>item.getAttribute('aria-expanded')==='true')?.dataset.industry||items[0]?.dataset.industry;
    function render(){
      const compact=mobile.matches;
      if(!compact&&active===null){active=items[0]?.dataset.industry;if(active)updateIndustry(items[0])}
      if(compact){industryList.removeAttribute('role');industryList.removeAttribute('aria-orientation')}
      else{industryList.setAttribute('role','tablist');industryList.setAttribute('aria-orientation','vertical')}
      const selected=items.find(item=>item.dataset.industry===active);
      if(compact){
        const wrapper=selected?.closest('.wf-capability-item');
        if(wrapper)wrapper.append(story);
        story.setAttribute('role','region');
      }else{
        industryPanelHost.append(story);
        story.setAttribute('role','tabpanel');
      }
      items.forEach(item=>{
        const isActive=item.dataset.industry===active;
        item.classList.toggle('active',isActive);
        if(compact){item.removeAttribute('role');item.removeAttribute('aria-selected');item.setAttribute('aria-expanded',String(isActive));item.removeAttribute('tabindex')}
        else{item.setAttribute('role','tab');item.setAttribute('aria-selected',String(isActive));item.removeAttribute('aria-expanded');item.tabIndex=isActive?0:-1}
      });
      story.hidden=active===null;
      if(selected){story.setAttribute('aria-labelledby',selected.id);story.classList.toggle('is-entering',!compact)}
    }
    items.forEach((item,index)=>{
      item.setAttribute('aria-controls',story.id);
      item.addEventListener('click',()=>{
        const next=mobile.matches&&active===item.dataset.industry?null:item.dataset.industry;
        if(next!==null)updateIndustry(item);
        active=next;render();
      });
      item.addEventListener('keydown',event=>{
        if(mobile.matches)return;
        let next;if(['ArrowRight','ArrowDown'].includes(event.key))next=(index+1)%items.length;if(['ArrowLeft','ArrowUp'].includes(event.key))next=(index+items.length-1)%items.length;if(event.key==='Home')next=0;if(event.key==='End')next=items.length-1;
        if(next!==undefined){event.preventDefault();active=items[next].dataset.industry;updateIndustry(items[next]);render();items[next].focus()}
      });
    });
    updateIndustry(items.find(item=>item.dataset.industry===active));render();mobile.addEventListener('change',render);
  }
  industryAccordionTabs();
})();
