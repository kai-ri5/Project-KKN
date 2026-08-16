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
    var now = new Date();
    document.getElementById('clockNow').textContent =
      pad(now.getHours())+':'+pad(now.getMinutes())+':'+pad(now.getSeconds());
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

    var stripEl = document.getElementById('nextPrayerStrip');
    if(upcoming){
      var card = document.querySelector('#jadwalGrid .jcard[data-key="'+upcoming+'"]');
      if(card) card.classList.add('active');
      var diff = toMinutes(jadwalData[upcoming]) - nowMin;
      var h = Math.floor(diff/60), m = diff%60;
      var sisa = h > 0 ? (h+' jam '+m+' menit') : (m+' menit');
      stripEl.textContent = PRAYER_LABEL[upcoming] + ' pukul ' + jadwalData[upcoming] + ' · ' + sisa + ' lagi';
    } else {
      // sudah lewat isya, sholat berikutnya subuh besok
      var card2 = document.querySelector('#jadwalGrid .jcard[data-key="subuh"]');
      if(card2) card2.classList.add('active');
      stripEl.textContent = 'Subuh besok pukul ' + (jadwalData.subuh || '--:--');
    }
  }
  setInterval(highlightNextPrayer, 30000);

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
          document.getElementById('nextPrayerStrip').textContent = 'Jadwal tidak tersedia saat ini';
        });
      });
  }

  loadJadwal();

  /* ===== BAITUL MAAL ===== */
  var BM_PROGRAMS = {
    zakat: {
      tag: 'Zakat',
      title: 'Penyaluran zakat melalui Baitul Maal',
      text: 'Baitul Maal Masjid Noor Islam menerima zakat maal dan zakat fitrah, lalu menyalurkannya kepada 8 asnaf mustahik di lingkungan Semaki Kulon dengan verifikasi takmir.',
      list: [
        'Identifikasi mustahik oleh tim takmir & RT setempat',
        'Penyaluran rutin bulanan & program Ramadan',
        'Rekap penerima dicatat untuk laporan jamaah'
      ]
    },
    infaq: {
      tag: 'Infaq',
      title: 'Infaq untuk operasional masjid',
      text: 'Infaq jamaah membantu biaya harian masjid: listrik, air, kebersihan, sound system, dan perlengkapan ibadah lima waktu.',
      list: [
        'Perawatan fasilitas sholat & tempat wudhu',
        'Kebutuhan takbir, mushaf, dan perlengkapan jamaah',
        'Dukungan kegiatan rutin masjid'
      ]
    },
    sedekah: {
      tag: 'Sedekah',
      title: 'Sedekah untuk warga & mustahik',
      text: 'Sedekah disalurkan untuk bantuan sosial warga Semaki Kulon: santunan, bantuan sembako, dan kebutuhan darurat.',
      list: [
        'Program bantuan fakir miskin & lansia',
        'Bantuan bencana / kebutuhan mendesak warga',
        'Kolaborasi dengan RT/RW setempat'
      ]
    },
    wakaf: {
      tag: 'Wakaf',
      title: 'Wakaf untuk kebermanfaatan jangka panjang',
      text: 'Wakaf uang atau barang dicatat sebagai aset masjid untuk pembangunan, perbaikan, dan program berkelanjutan.',
      list: [
        'Pencatatan wakaf oleh takmir masjid',
        'Digunakan sesuai peruntukan yang disepakati',
        'Laporan perkembangan aset wakaf'
      ]
    }
  };

  var bmDetailEl = document.getElementById('bmDetail');
  var bmPrograms = document.querySelectorAll('.bm-program');

  function setBmProgram(key){
    var data = BM_PROGRAMS[key];
    if(!data) return;
    document.getElementById('bmDetailTag').textContent = data.tag;
    document.getElementById('bmDetailTitle').textContent = data.title;
    document.getElementById('bmDetailText').textContent = data.text;
    var listEl = document.getElementById('bmDetailList');
    listEl.innerHTML = data.list.map(function(item){ return '<li>'+item+'</li>'; }).join('');
    bmPrograms.forEach(function(btn){
      var active = btn.getAttribute('data-program') === key;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    if(bmDetailEl){
      bmDetailEl.style.animation = 'none';
      void bmDetailEl.offsetWidth;
      bmDetailEl.style.animation = '';
    }
  }

  bmPrograms.forEach(function(btn){
    btn.addEventListener('click', function(){
      setBmProgram(btn.getAttribute('data-program'));
    });
  });

  var copyBtn = document.getElementById('bmCopyBtn');
  if(copyBtn){
    copyBtn.addEventListener('click', function(){
      var rek = document.getElementById('bmRekNumber');
      var note = document.getElementById('bmCopyNote');
      if(!rek || copyBtn.disabled) return;
      var text = rek.textContent.trim();
      if(!text || text.indexOf('menyusul') !== -1 || text.indexOf('akan ditambahkan') !== -1) return;
      navigator.clipboard.writeText(text.replace(/\s/g,'')).then(function(){
        copyBtn.textContent = 'Tersalin!';
        copyBtn.classList.add('copied');
        if(note) note.textContent = 'Nomor rekening berhasil disalin.';
        setTimeout(function(){
          copyBtn.textContent = 'Salin';
          copyBtn.classList.remove('copied');
          if(note) note.textContent = 'Pastikan transfer ke rekening resmi Baitul Maal.';
        }, 2000);
      }).catch(function(){
        if(note) note.textContent = 'Salin manual: ' + text;
      });
    });
  }
})();