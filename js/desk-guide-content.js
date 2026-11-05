/* desk-guide-content.js: the wording of the desk booking guide ("Explain this policy to your end users"),
   worked out from a Configuration wizard project. One source for both the printable guide
   (pages/floorsense-desk-booking-guide-live.html) and the presentation builder's guide slides.

     deskGuideContent(project) -> { sections: [ { key, title, items: [ { id, title, text, example? } ] } ] }

   Only the items that apply to this project are returned (for example "Some desks power off until you
   check in" only when No Swipe No Power is on). Defaults match the wizard's own defaults. */
(function (root) {
  'use strict';
  function formatMinutes(m) {
    if (!Number.isFinite(m) || m <= 0) return '0 minutes';
    if (m % 60 === 0) { var h = m / 60; return h + (h === 1 ? ' hour' : ' hours'); }
    return m + ' minutes';
  }
  function formatClock(t) {
    var m = ((t % 1440) + 1440) % 1440, h24 = Math.floor(m / 60), min = m % 60, h12 = h24 % 12 || 12;
    return h12 + (min === 0 ? '' : ':' + String(min).padStart(2, '0')) + ' ' + (h24 >= 12 ? 'PM' : 'AM');
  }
  function formatCheckinClock(t) {
    var m = ((t % 1440) + 1440) % 1440, h24 = Math.floor(m / 60), min = m % 60, h12 = h24 % 12 || 12;
    return h12 + ':' + String(min).padStart(2, '0') + ' ' + (h24 >= 12 ? 'PM' : 'AM');
  }
  var num = function (v, d) { return Number.isFinite(v) ? v : d; };

  function deskGuideContent(project) {
    var wizard = (project && project.floorsense && project.floorsense.wizard) || {};

    /* ---- Booking & Check-in ---- */
    var cw = wizard.checkinWindow || {};
    var earlyMin = num(cw.checkInEarlyMinutes, 30), lateMin = num(cw.checkInLateMinutes, 60);
    var checkin = { id: 'checkin_window', title: 'Check-in window',
      text: 'You can check in to your desk starting ' + formatMinutes(earlyMin) + ' before your booking begins, up to ' +
        formatMinutes(lateMin) + ' after it starts. If you don\'t check in within that window, your desk becomes available to others.',
      example: '8:00 AM booking → check in between ' + formatClock(8 * 60 - earlyMin) + '–' + formatClock(8 * 60 + lateMin) };

    var advanceDays = num((wizard.prebookingAdvance || {}).prebookingAdvanceDays, 8);
    var plan = { id: 'plan_ahead', title: 'Plan up to ' + advanceDays + (advanceDays === 1 ? ' day' : ' days') + ' ahead',
      text: 'Need to plan your week? You can book a desk as much as ' + advanceDays + (advanceDays === 1 ? ' day' : ' days') +
        ' before you need it. Book in the Floorsense mobile app or the web app at my.floorsense.com.au.' };

    var drt = wizard.defaultReservationTimes || {}, bh = wizard.businessHours || {};
    var st = (bh.arrivalTime || drt.defaultStartTime || '08:30').split(':').map(Number);
    var defStart = num(st[0], 8) * 60 + num(st[1], 30);
    var sel = Array.isArray((wizard.reservationTypes || {}).selected) ? wizard.reservationTypes.selected : ['adhoc'];
    var dedicated = sel.indexOf('fixed') !== -1, dedicatedOnly = sel.length > 0 && sel.every(function (t) { return t === 'fixed'; });
    var NOTE = 'If an admin has assigned a desk to you, it stays yours and you can\'t release it yourself — ask your admin if it needs to change.';
    var mode = (wizard.reservationLength || {}).reservationLengthMode || 'release';
    var defEnd;
    if (drt.endMode === 'fixed-end') {
      var en = (bh.departureTime || drt.defaultEndTime || '17:00').split(':').map(Number);
      defEnd = num(en[0], 17) * 60 + num(en[1], 0);
    } else defEnd = defStart + Math.round(num(drt.defaultDurationHours, 9) * 60);
    var dTitle, dText;
    if (dedicatedOnly) { dTitle = 'Desks assigned by an admin'; dText = NOTE + ' There\'s no daily booking to worry about.'; }
    else if (mode === 'endOfDay') {
      dTitle = 'Reservation ends at close of business hours';
      dText = 'Every booking ends at the same time each day, no matter when it starts — book early for a longer reservation, book late for a shorter one. By default, that\'s ' + formatClock(defEnd) + '.';
    } else if (mode === 'fixed') {
      dTitle = 'Default reservation duration';
      if (drt.endMode === 'fixed-end') {
        dText = 'If someone books without choosing a time, their reservation defaults to starting at ' + formatCheckinClock(defStart) + ' and always ends at ' + formatCheckinClock(defEnd) + ', regardless of when it starts.';
      } else {
        var hrs = num(drt.defaultDurationHours, 9);
        dText = 'If someone books without choosing a time, their reservation defaults to starting at ' + formatCheckinClock(defStart) + ' and lasting ' + hrs + (hrs === 1 ? ' hour' : ' hours') + ' (until ' + formatCheckinClock(defEnd) + ').';
      }
    } else {
      dTitle = 'Your desk is yours until you release it';
      dText = 'When you book a desk, it stays reserved until you check out or release it yourself — no need to watch the clock. By default, bookings run from ' + formatClock(defStart) + ' to ' + formatClock(defEnd) + ' unless you end yours sooner.';
    }
    if (dedicated && !dedicatedOnly) dText += ' ' + NOTE;
    var duration = { id: 'duration', title: dTitle, text: dText };

    var md = wizard.maxDesksPerUser || {}, mm = md.mode || '1';
    var label = mm === '2' ? 'two' : mm === 'other' ? String(md.otherValue || '1') : 'one';
    var maxText = label === 'one' ? 'You can have one desk reserved at once.' : 'You can have up to ' + label + ' desks reserved at once.';
    maxText += md.allowMeetingSpaceTag
      ? ' You can also tag onto certain meeting-space desks without losing your existing desk booking.'
      : ' Some teams or workplaces raise this limit — if you\'re not sure how many desks you\'re able to book, check with your workplace team.';
    var maxDesks = { id: 'max_desks', title: (label === 'one' ? 'One desk' : 'Up to ' + label + ' desks') + ' at a time, by default', text: maxText };

    /* ---- Tapping In & Out ---- */
    var tapping = [
      { id: 'tap_in_out', title: 'Tap once to arrive, tap again to leave', text: 'Your first tap of the day checks you in. When you\'re done, tap again at the same desk to check out. That\'s it.' },
      { id: 'elsewhere', title: 'Sitting somewhere else? No problem', text: 'If you booked one desk but end up checking in at a different one, we\'ll automatically release your original booking — so nobody else is left waiting on a desk you\'re not using.' }];
    var nsnp = wizard.nsnp || {};
    if (nsnp.mode && nsnp.mode !== 'none') {
      var nt = 'Some desks power off automatically at the end of your reservation unless you check in — tap in as soon as you arrive to keep the power on. Permanently assigned desks stay powered on all the time.';
      if (nsnp.graceEnabled) nt += ' Power stays on for a further ' + num(nsnp.graceMinutes, 15) + ' minutes after your reservation ends before switching off.';
      tapping.push({ id: 'nsnp', title: 'Some desks power off until you check in', text: nt });
    }
    if (wizard.remoteConfirm && wizard.remoteConfirm.enabled) tapping.push({ id: 'remote_confirm', title: 'Or just confirm your booking remotely', text: 'No need to tap in at the desk itself — you can confirm your booking remotely with a tap, any time, from the app.' });
    var ac = wizard.autoOccupancyCheckin || {};
    if (ac.enabled) {
      var am = num(ac.minutes, 10);
      tapping.push({ id: 'auto_checkin', title: 'Forgot to tap in? You might still be covered',
        text: 'If a desk detects you\'re sitting at it for about ' + am + (am === 1 ? ' minute' : ' minutes') + ' without a manual tap-in, it\'ll check you in automatically so you don\'t lose the booking. The system can\'t always tell who\'s sitting there in that case, so it\'s still best to tap in yourself whenever you can.' });
    }

    /* ---- Your Toolbox ---- */
    var methods = Array.isArray((wizard.checkinMethods || {}).selected) && wizard.checkinMethods.selected.length ? wizard.checkinMethods.selected : ['card', 'prebooking'];
    var PH = { card: 'your building access card', prebooking: 'the Floorsense mobile app or the desktop browser portal (my.floorsense.com.au)', qr: 'a QR code at the desk', wallet: 'a wallet pass on your phone' };
    var ph = methods.map(function (m) { return PH[m]; }).filter(Boolean), ms;
    if (!ph.length) ms = 'Check in with your building access card.';
    else if (ph.length === 1) ms = 'Check in with ' + ph[0] + '.';
    else ms = 'Check in with ' + ph.slice(0, -1).join(', ') + ', or ' + ph[ph.length - 1] + '.';
    if (methods.indexOf('wallet') !== -1) ms += ' Wallet pass may not be available on every plan — ask your workplace team if you\'re not sure.';
    var toolbox = [{ id: 'checkin_methods', title: 'Use whatever\'s easiest for you', text: ms }];
    var fme = wizard.fme || {};
    if (fme.mode === 'all' || fme.mode === 'list') toolbox.push({ id: 'sitstand', title: 'Save your ideal sit-stand height', text: fme.mode === 'all'
      ? 'Save and apply your preferred height right from the Floorsense mobile app or the desk\'s handset.'
      : 'Some desks support sit-stand height presets via the Floorsense mobile app or handset — look for signage or ask your workplace team which desks support it.' });
    var oob = wizard.outOfBoxPolicy || {};
    if (oob.recurringEnabled === true) toolbox.push({ id: 'recurring', title: 'Set up repeating bookings', text: 'Need the same desk on a regular schedule? You can set up a recurring booking in one go via my.floorsense.com.au desktop app, so you don\'t have to book it fresh every time.' });
    if (oob.dndEnabled !== false) toolbox.push({ id: 'dnd', title: 'Need quiet time? Turn on Do Not Disturb', text: 'Set your status to Do Not Disturb whenever you need heads-down focus time — it lets colleagues know not to interrupt you.' });

    return { sections: [
      { key: 'booking', title: 'Booking & Check-in', items: [checkin, plan, duration, maxDesks] },
      { key: 'tapping', title: 'Tapping In & Out', items: tapping },
      { key: 'toolbox', title: 'Your Toolbox', items: toolbox }] };
  }
  root.deskGuideContent = deskGuideContent;
})(typeof window !== 'undefined' ? window : this);
