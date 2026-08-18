(function(){
  var PRAYER_ORDER = ['imsak','subuh','dzuhur','ashar','maghrib','isya'];
  var PRAYER_LABEL = {imsak:'Imsak', subuh:'Subuh', dzuhur:'Dzuhur', ashar:'Ashar', maghrib:'Maghrib', isya:'Isya'};
  var PRAYER_ICON = {
    imsak:  '<svg class="jcard-icon icon-anim icon-sway" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 3v2M12 19v2M5 12H3M21 12h-2M7.8 7.8 6.3 6.3M17.7 17.7l-1.5-1.5M7.8 16.2 6.3 17.7M17.7 6.3l-1.5 1.5"/></svg>',
    subuh:  '<svg class="jcard-icon icon-anim icon-float" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 2v4M4.9 4.9l2.8 2.8M2 12h4M4.9 19.1l2.8-2.8M12 18v4M19.1 19.1l-2.8-2.8M18 12h4M19.1 4.9l-2.8 2.8"/></svg>',
    dzuhur: '<svg class="jcard-icon icon-anim icon-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>',
    ashar:  '<svg class="jcard-icon icon-anim icon-sway" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M17 18a5 5 0 1 0-10 0"/><path d="M12 9V2M4.2 4.2l1.4 1.4"/></svg>',
    maghrib:'<svg class="jcard-icon icon-anim icon-float" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 10V2M4.2 4.2l1.4 1.4M2 12h2M4.2 19.8l1.4-1.4M12 22v-2"/><path d="M17 18a5 5 0 1 0-10 0"/></svg>',
    isya:   '<svg class="jcard-icon icon-anim icon-twinkle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
  };
  var FALLBACK_KOTA_ID = '1219'; // Kota Yogyakarta (cadangan jika pencarian gagal)
  var jadwalData = null;

  function pad(n){ return n < 10 ? '0'+n : ''+n; }

  function updateClock(){
    var el = document.getElementById('clockNow');
    if(!el) return;
    var now = new Date();
    el.textContent = pad(now.getHours())+':'+pad(now.getMinutes())+':'+pad(now.getSeconds());
  }
  setInterval(updateClock, 1000);
  updateClock();

  function toMinutes(hhmm){
    var p = hhmm.split(':');
    return parseInt(p[0],10)*60 + parseInt(p[1],10);
  }

  function renderJadwal(jadwal, lokasiLabel, tanggalLabel){
    jadwalData = jadwal;
    var grid = document.getElementById('jadwalGrid');
    var cardsHtml = '';
    var order = ['imsak','subuh','dzuhur','ashar','maghrib','isya'];
    order.forEach(function(key){
      cardsHtml += '<div class="jcard" data-key="'+key+'">'+
        (PRAYER_ICON[key] || '') +
        '<div class="jname">'+PRAYER_LABEL[key]+'</div>'+
        '<div class="jtime">'+ (jadwal[key] || '--:--') +'</div></div>';
    });
    grid.innerHTML = cardsHtml;
    document.getElementById('jadwalTanggal').textContent = tanggalLabel || '';
    document.getElementById('jadwalSumber').textContent = 'Wilayah: ' + (lokasiLabel || 'Kota Yogyakarta') + ' · Sumber: Kemenag RI (api.myquran.com)';
    document.getElementById('jadwalStatus').textContent = '';
    highlightNextPrayer();
  }

  function highlightNextPrayer(){
    if(!jadwalData) return;
    var now = new Date();
    var nowMin = now.getHours()*60 + now.getMinutes();
    var cards = document.querySelectorAll('#jadwalGrid .jcard');
    cards.forEach(function(c){ c.classList.remove('active'); });

    var upcoming = null;
    for(var i=0;i<PRAYER_ORDER.length;i++){
      var key = PRAYER_ORDER[i];
      if(key === 'imsak') continue; // imsak bukan waktu sholat wajib
      if(!jadwalData[key]) continue;
      if(toMinutes(jadwalData[key]) > nowMin){ upcoming = key; break; }
    }

    // === Countdown card (pc-*) ===
    var pcNameEl = document.getElementById('pcNextName');
    var pcTimeEl = document.getElementById('pcTime');
    var pcTimerEl = document.getElementById('pcTimer');
    var targetKey, targetHHMM, isTomorrow = false;

    if(upcoming){
      var card = document.querySelector('#jadwalGrid .jcard[data-key="'+upcoming+'"]');
      if(card) card.classList.add('active');
      targetKey = upcoming;
      targetHHMM = jadwalData[upcoming];
    } else {
      var card2 = document.querySelector('#jadwalGrid .jcard[data-key="subuh"]');
      if(card2) card2.classList.add('active');
      targetKey = 'subuh';
      targetHHMM = jadwalData.subuh;
      isTomorrow = true;
    }

    if(pcNameEl) pcNameEl.textContent = PRAYER_LABEL[targetKey] || 'Sholat';
    if(pcTimeEl) pcTimeEl.textContent = targetHHMM || '--:--';

    if(pcTimerEl && targetHHMM){
      var p = targetHHMM.split(':');
      var targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(p[0],10), parseInt(p[1],10), 0);
      if(isTomorrow || targetDate.getTime() <= now.getTime()){
        targetDate.setDate(targetDate.getDate()+1);
      }
      var diffMs = targetDate.getTime() - now.getTime();
      var totalSec = Math.max(0, Math.floor(diffMs/1000));
      var hh = Math.floor(totalSec/3600);
      var mm = Math.floor((totalSec%3600)/60);
      var ss = totalSec%60;
      pcTimerEl.textContent = pad(hh)+':'+pad(mm)+':'+pad(ss);
    }
  }
  setInterval(highlightNextPrayer, 1000);

  function fetchJadwalById(kotaId, lokasiLabel){
    var now = new Date();
    var y = now.getFullYear(), m = pad(now.getMonth()+1), d = pad(now.getDate());
    var url = 'https://api.myquran.com/v2/sholat/jadwal/'+kotaId+'/'+y+'/'+m+'/'+d;
    return fetch(url).then(function(r){ return r.json(); }).then(function(res){
      if(!res || !res.status || !res.data || !res.data.jadwal) throw new Error('format tidak sesuai');
      var j = res.data.jadwal;
      var label = res.data.lokasi || lokasiLabel;
      renderJadwal(j, label, j.tanggal || '');
    });
  }

  function loadJadwal(){
    document.getElementById('jadwalStatus').textContent = 'Memuat jadwal dari Kemenag…';
    fetch('https://api.myquran.com/v2/sholat/kota/cari/yogyakarta')
      .then(function(r){ return r.json(); })
      .then(function(res){
        var id = FALLBACK_KOTA_ID;
        var label = 'Kota Yogyakarta';
        if(res && res.status && Array.isArray(res.data)){
          var match = res.data.find(function(k){
            return /kota yogyakarta/i.test(k.lokasi || '');
          });
          if(match){ id = match.id; label = match.lokasi; }
        }
        return fetchJadwalById(id, label);
      })
      .catch(function(){
        // fallback langsung pakai ID cadangan
        fetchJadwalById(FALLBACK_KOTA_ID, 'Kota Yogyakarta').catch(function(){
          document.getElementById('jadwalStatus').textContent =
            'Jadwal sholat belum bisa dimuat otomatis saat ini. Silakan periksa kembali beberapa saat lagi.';
          var pcTimerFallback = document.getElementById('pcTimer');
          if(pcTimerFallback) pcTimerFallback.textContent = '--:--:--';
        });
      });
  }

  loadJadwal();

  // ===== KEGIATAN (dari Supabase) =====
  var SUPABASE_URL = 'https://ljgedntbohlgdtkphqex.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_j06auKDeW4sdrJGBoIqkXg_F3dQSjV9';
  var supabaseClient = null;
  if (window.supabase && window.supabase.createClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  function escapeHtml(str){
    if(!str) return '';
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function renderKegiatan(list){
    var grid = document.getElementById('kegiatanGrid');
    var note = document.getElementById('kegiatanNote');
    if(!grid) return;

    if(!list || list.length === 0){
      grid.innerHTML = '';
      if(note){
        note.style.display = 'block';
        note.textContent = 'Belum ada kegiatan yang ditambahkan oleh takmir. Bagian ini akan otomatis terisi begitu data dimasukkan.';
      }
      return;
    }

    if(note) note.style.display = 'none';
    var html = '';
    list.forEach(function(k){
      var jadwalTxt = [k.hari, k.jam].filter(Boolean).join(' · ');
      html += '<div class="keg-card">'+
        '<div>'+
          (jadwalTxt ? '<div class="keg-tag">'+escapeHtml(jadwalTxt)+'</div>' : '') +
          '<h3>'+escapeHtml(k.nama_kegiatan || 'Kegiatan')+'</h3>'+
          (k.deskripsi ? '<p>'+escapeHtml(k.deskripsi)+'</p>' : '') +
        '</div>'+
      '</div>';
    });
    grid.innerHTML = html;
  }

  function loadKegiatan(){
    if(!supabaseClient){
      renderKegiatan([]);
      return;
    }
    supabaseClient
      .from('kegiatan')
      .select('*')
      .order('id', { ascending: true })
      .then(function(res){
        if(res.error){
          console.error('Gagal ambil data kegiatan:', res.error);
          renderKegiatan([]);
          return;
        }
        renderKegiatan(res.data);
      });
  }

  loadKegiatan();
})();