document.addEventListener("DOMContentLoaded", () => {
  // --- Setup & Constants ---
  const scrollHint = document.querySelector(".scroll-hint"),
    navScroll = document.querySelector(".nav-scroll"),
    header = document.getElementById("main-header"),
    snapContainer = document.querySelector(".snap-container"),
    menuToggle = document.getElementById("menu-toggle"),
    headerNav = document.querySelector(".header-nav");

  if (!snapContainer) return;

  // --- Optimized Scroll Handling (Window Scroll) ---
  let isTicking = false;
  window.addEventListener("scroll", () => {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        const y = window.scrollY;

        // Header & UI States
        if (scrollHint) {
          scrollHint.style.opacity = y > 100 ? '0' : '1';
          scrollHint.style.pointerEvents = y > 100 ? 'none' : 'auto';
        }
        if (navScroll) navScroll.classList.toggle("visible", y > 50);
        if (header) header.classList.toggle("scrolled", y > 50);

        isTicking = false;
      });
      isTicking = true;
    }
  }, { passive: true });



  // --- Navigation & Mobile Menu ---
  menuToggle?.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    headerNav?.classList.toggle("active");
    header?.classList.toggle("menu-active");
  });

  header?.addEventListener("click", (e) => {
    if (e.target.classList.contains("header-logo")) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (e.target.classList.contains("nav-link")) {
      e.preventDefault();

      // Close mobile menu on link click
      menuToggle?.classList.remove("active");
      headerNav?.classList.remove("active");
      header?.classList.remove("menu-active");

      const targetId = e.target.getAttribute("href");
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        window.scrollTo({ top: targetEl.offsetTop, behavior: 'smooth' });
      }
    }
  });

  // --- VIP Modal Logic ---
  const vipModal = document.getElementById("vip-modal");
  const vipClose = document.getElementById("vip-close");
  const vipForm = document.getElementById("vip-form");
  const vipFormFeedback = document.getElementById("vip-form-feedback");
  const vipSubmitBtn = vipForm?.querySelector('button[type="submit"]');
  const vipAgentSelect = document.getElementById("vip-agent");
  const vipDateSelect = document.getElementById("vip-date");
  const vipSlotSelect = document.getElementById("vip-slot");
  const vipCitySelect = document.getElementById("vip-city");
  const vipUserCityInput = document.getElementById("vip-user-city");
  const vipModalDateBadge = document.getElementById("vip-modal-date-badge");
  const vipModalSubtitle = document.getElementById("vip-modal-subtitle");
  const LEAD_API_URL = "https://admin.inchbrick.com/api/expo";
  const AGENT_API_URL = "https://admin.inchbrick.com/api/admin-register?status=1&is_agent=1&columns=firstName,lastName,userCode,designation";
  const VIP_THANK_YOU_PERTH = "thank-you-perth.html";
  const VIP_THANK_YOU_DUBAI = "thank-you-dubai.html";

  const warmVipBackendConnections = () => {
    if (window.__vipBackendWarmed) return;
    window.__vipBackendWarmed = true;
    fetch(LEAD_API_URL, { method: "HEAD", mode: "cors", cache: "no-store", priority: "low" }).catch(
      () => { }
    );
  };

  const prefetchVipThankYouPages = () => {
    if (window.__vipThanksPrefetched) return;
    window.__vipThanksPrefetched = true;
    [VIP_THANK_YOU_PERTH, VIP_THANK_YOU_DUBAI].forEach((href) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = href;
      link.as = "document";
      document.head.appendChild(link);
    });
  };

  const EXPO_BY_KEY = {
    australia: {
      eventValue: "Australia Expo 2026",
      visitcountry: "Australia",
      dateBanner: "16th - 17th MAY 2026",
      subtitle: "Experience luxury Indian living at the Perth Property Expo.",
      dates: [
        { value: "16th May", label: "16th May" },
        { value: "17th May", label: "17th May" }
      ]
    },
    dubai: {
      eventValue: "Dubai Expo 2026 (Godrej)",
      visitcountry: "UAE",
      dateBanner: "16th - 17th MAY 2026",
      subtitle: "Discover premium investment opportunities at the Dubai Property Expo.",
      dates: [
        { value: "16th May", label: "16th May" },
        { value: "17th May", label: "17th May" }
      ]
    },
    singapore: {
      eventValue: "Singapore Expo 2026",
      visitcountry: "Singapore",
      dateBanner: "23rd - 24th MAY 2026",
      subtitle: "Join the elite investors circle at the Singapore Property Expo.",
      dates: [
        { value: "23rd May", label: "23rd May" },
        { value: "24th May", label: "24th May" }
      ]
    },
    lagos: {
      eventValue: "Lagos Expo 2026",
      visitcountry: "Nigeria",
      dateBanner: "6th - 7th JUNE 2026",
      subtitle: "Explore high-growth Indian real estate in Lagos, Nigeria.",
      dates: [
        { value: "6th June", label: "6th June" },
        { value: "7th June", label: "7th June" }
      ]
    },
    hongkong: {
      eventValue: "Hong Kong Expo 2026",
      visitcountry: "Hong Kong",
      dateBanner: "COMING SOON",
      subtitle: "Exclusive real estate opportunities arriving soon in Hong Kong.",
      dates: [
        { value: "TBA", label: "Coming Soon" }
      ]
    }
  };

  const SHARED_VIP_DATES = EXPO_BY_KEY.australia.dates;

  const GENERIC_VIP = {
    dateBanner: "Select your expo city",
    subtitle:
      "Both expos are 16–17 May 2026. Choose Perth (Australia) or Dubai (UAE) below — Dubai unlocks extra evening time slots."
  };

  const rebuildVipDateOptions = (dates) => {
    if (!vipDateSelect) return;
    const preserved = vipDateSelect.value;
    vipDateSelect.innerHTML = '<option value="" disabled selected>Preferred Date</option>';
    dates.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d.value;
      opt.textContent = d.label;
      vipDateSelect.appendChild(opt);
    });
    if (dates.some((d) => d.value === preserved)) {
      vipDateSelect.value = preserved;
    }
  };

  const vipEventSelect = document.getElementById("vip-event");
  const updateVipSlots = () => {
    if (!vipEventSelect || !vipSlotSelect) return;
    const isDubai = vipEventSelect.value.includes("Dubai");

    const baseSlots = [
      "10 AM - 12 PM",
      "12 PM - 2 PM",
      "2 PM - 4 PM",
      "4 PM - 6 PM"
    ];
    const extraDubaiSlots = ["6 PM - 8 PM", "8 PM - 10 PM"];
    const finalSlots = isDubai ? [...baseSlots, ...extraDubaiSlots] : baseSlots;

    const currentValue = vipSlotSelect.value;
    vipSlotSelect.innerHTML = '<option value="" disabled selected>Preferred Slot</option>';

    finalSlots.forEach((slot) => {
      const opt = document.createElement("option");
      opt.value = slot;
      opt.textContent = slot;
      vipSlotSelect.appendChild(opt);
    });

    if (finalSlots.includes(currentValue)) {
      vipSlotSelect.value = currentValue;
    }
  };

  const applyExpoToForm = (expoKey) => {
    const cfg = EXPO_BY_KEY[expoKey] || EXPO_BY_KEY.australia;
    if (vipEventSelect) vipEventSelect.value = cfg.eventValue;
    if (vipModalDateBadge) vipModalDateBadge.textContent = cfg.dateBanner;
    if (vipModalSubtitle) vipModalSubtitle.textContent = cfg.subtitle;
    rebuildVipDateOptions(cfg.dates);
    updateVipSlots();
  };

  const applyGenericVipModal = () => {
    if (vipEventSelect) vipEventSelect.value = "";
    if (vipModalDateBadge) vipModalDateBadge.textContent = GENERIC_VIP.dateBanner;
    if (vipModalSubtitle) vipModalSubtitle.textContent = GENERIC_VIP.subtitle;
    rebuildVipDateOptions(SHARED_VIP_DATES);
    updateVipSlots();
  };

  const openVipModal = (maybeKey) => {
    warmVipBackendConnections();
    prefetchVipThankYouPages();
    if (maybeKey && EXPO_BY_KEY[maybeKey]) {
      applyExpoToForm(maybeKey);
    } else {
      applyGenericVipModal();
    }
    if (vipModal) vipModal.classList.add("active");
  };

  window.openVipModal = openVipModal;

  const closeVipModal = () => {
    if (vipModal) vipModal.classList.remove("active");
  };

  vipClose?.addEventListener("click", closeVipModal);
  vipModal?.addEventListener("click", (e) => {
    if (e.target === vipModal) closeVipModal();
  });

  const setFormFeedback = (message, type = "error") => {
    if (!vipFormFeedback) return;
    vipFormFeedback.style.display = "block";
    vipFormFeedback.textContent = message;
    vipFormFeedback.style.color = type === "success" ? "#32d27e" : "#ff8e8e";
  };

  const clearFormFeedback = () => {
    if (!vipFormFeedback) return;
    vipFormFeedback.style.display = "none";
    vipFormFeedback.textContent = "";
  };

  vipEventSelect?.addEventListener("change", () => {
    const v = vipEventSelect.value?.trim() || "";
    if (!v) {
      applyGenericVipModal();
      return;
    }
    applyExpoToForm(v.includes("Dubai") ? "dubai" : "australia");
  });
  applyGenericVipModal();

  const normalizeExpoDate = (rawDate) => {
    if (!rawDate) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) return rawDate;

    const map = {
      "16th May": "2026-05-16",
      "17th May": "2026-05-17"
    };
    if (map[rawDate]) return map[rawDate];

    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return "";
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const dd = String(parsed.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const validateVipPayload = ({ name, email, mobile, city, agent, slot, expodate }) => {
    if (!name || name.length < 2) return "Please enter your full name (minimum 2 characters).";
    if (!/^[A-Za-z][A-Za-z\s.'-]{1,79}$/.test(name)) return "Please enter a valid full name.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return "Please enter a valid email address.";
    if (!mobile || !/^\+?[0-9][0-9\s\-()]{7,19}$/.test(mobile)) return "Please enter a valid mobile number.";
    if (!city || city.length < 2) return "Please enter your city.";
    if (!agent) return "Please select agent.";
    if (!slot) return "Please select slot.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expodate)) return "Please select a valid preferred date.";
    return "";
  };

  const populateAgentDropdown = async () => {
    if (!vipAgentSelect) return;

    vipAgentSelect.innerHTML = '<option value="">Loading agents...</option>';
    vipAgentSelect.disabled = true;

    try {
      const response = await fetch(AGENT_API_URL, {
        method: "GET",
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error(`API ${response.status}`);

      const raw = await response.json();
      const agents = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];

      vipAgentSelect.innerHTML = '<option value="" disabled selected>Select Portfolio Manager</option>';

      agents
        .filter((agent) => agent?.userCode)
        .filter((agent) => {
          const fullName = `${agent.firstName || ""} ${agent.lastName || ""}`.trim().toLowerCase();
          return !fullName.includes("richa jain") && !fullName.includes("chubasangla");
        })
        .forEach((agent) => {
          const fullName = `${agent.firstName || ""} ${agent.lastName || ""}`.trim() || String(agent.userCode).trim();
          const option = document.createElement("option");
          option.value = String(agent.userCode).trim();
          option.textContent = fullName;
          option.dataset.agentName = fullName;
          vipAgentSelect.appendChild(option);
        });

      if (vipAgentSelect.options.length <= 1) {
        throw new Error("No agent records");
      }
    } catch (error) {
      console.error("Failed to fetch agents", error);
      vipAgentSelect.innerHTML = [
        '<option value="" disabled selected>Select Portfolio Manager</option>',
        '<option value="Inchbrick" data-agent-name="Inchbrick">Inchbrick</option>'
      ].join("");
    } finally {
      vipAgentSelect.disabled = false;
    }
  };

  const PASS_CDN_BASE = "https://cdn.inchbrick.com";

  const normalizePossibleUrl = (value) => {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith("/")) return `${PASS_CDN_BASE}${trimmed}`;
    return "";
  };

  const sanitizePassPath = (pathValue) => {
    if (typeof pathValue !== "string") return "";
    let path = pathValue.trim();
    if (!path) return "";
    if (!path.startsWith("/")) path = `/${path}`;
    path = path.replace("/expo_pass/", "/expo-pass/");
    path = path.replace(/\s+/g, "-");
    return path;
  };

  const buildPassUrl = (passPathOrUrl, passNo) => {
    const normalized = normalizePossibleUrl(passPathOrUrl);
    if (normalized) {
      return normalized.replace("/expo_pass/", "/expo-pass/").replace(/\s+/g, "-");
    }

    const sanitizedPath = sanitizePassPath(passPathOrUrl);
    if (sanitizedPath) return `${PASS_CDN_BASE}${sanitizedPath}`;

    if (passNo) {
      const safePassNo = String(passNo).trim().replace(/\s+/g, "-");
      return `${PASS_CDN_BASE}/expo-pass/${safePassNo}.jpg`;
    }
    return "";
  };

  const findFirstPassLikeUrl = (node, visited = new Set()) => {
    if (!node || typeof node !== "object") return "";
    if (visited.has(node)) return "";
    visited.add(node);

    const urlHintRegex = /(pass|ticket|download|pdf|invite|invitation|file)/i;
    const fileHintRegex = /\.(pdf|png|jpg|jpeg|webp)(\?|$)/i;

    for (const [key, value] of Object.entries(node)) {
      if (typeof value === "string") {
        const normalized = normalizePossibleUrl(value);
        if (normalized && (urlHintRegex.test(key) || fileHintRegex.test(normalized) || urlHintRegex.test(normalized))) {
          return normalized;
        }
      }
    }

    for (const value of Object.values(node)) {
      if (typeof value === "object" && value !== null) {
        const nested = findFirstPassLikeUrl(value, visited);
        if (nested) return nested;
      }
    }

    return "";
  };

  const getPassUrlFromResponse = (responseData) => {
    const passOnly = buildPassUrl(
      responseData?.data?.pass || responseData?.pass,
      responseData?.data?.passno || responseData?.passno
    );
    if (passOnly) return passOnly;

    const directCandidates = [
      responseData?.data?.downloadUrl,
      responseData?.data?.download_url,
      responseData?.data?.pdf,
      responseData?.data?.pdfUrl,
      responseData?.data?.file,
      responseData?.data?.ticketUrl,
      responseData?.data?.ticket_url,
      responseData?.data?.pass,
      responseData?.downloadUrl
    ];

    for (const candidate of directCandidates) {
      const normalized = buildPassUrl(candidate, responseData?.data?.passno || responseData?.passno);
      if (normalized) return normalized;
    }

    const discovered = findFirstPassLikeUrl(responseData);
    if (discovered) return buildPassUrl(discovered, responseData?.data?.passno || responseData?.passno);

    return buildPassUrl("", responseData?.data?.passno || responseData?.passno);
  };

  const VIP_SUBMIT_STATUS_MS = 3200;
  const VIP_SUBMIT_MESSAGES = [
    "Submitting…",
    "Creating your VIP pass…",
    "Still working — please wait…",
    "Almost there…"
  ];
  let vipSubmitStatusTimerId = null;
  const clearVipSubmitStatusRotation = () => {
    if (vipSubmitStatusTimerId !== null) {
      clearInterval(vipSubmitStatusTimerId);
      vipSubmitStatusTimerId = null;
    }
  };
  const startVipSubmitStatusRotation = () => {
    clearVipSubmitStatusRotation();
    let idx = 0;
    if (vipSubmitBtn) vipSubmitBtn.textContent = VIP_SUBMIT_MESSAGES[0];
    vipSubmitStatusTimerId = window.setInterval(() => {
      idx = Math.min(idx + 1, VIP_SUBMIT_MESSAGES.length - 1);
      if (vipSubmitBtn) vipSubmitBtn.textContent = VIP_SUBMIT_MESSAGES[idx];
    }, VIP_SUBMIT_STATUS_MS);
  };

  vipForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFormFeedback();

    const selectedAgent = vipAgentSelect?.value?.trim() || "Inchbrick";
    const selectedAgentName = vipAgentSelect?.selectedOptions?.[0]?.dataset?.agentName || selectedAgent;
    const selectedDate = normalizeExpoDate(vipDateSelect?.value || "");
    const selectedSlot = vipSlotSelect?.value || "";
    const selectedCity = vipCitySelect?.value || "";
    const selectedUserCity = vipUserCityInput?.value?.trim() || "";
    const eventValue = vipEventSelect?.value?.trim() || "";
    if (!eventValue) {
      setFormFeedback("Please select your expo city.");
      return;
    }
    const visitcountry = eventValue.includes("Dubai")
      ? EXPO_BY_KEY.dubai.visitcountry
      : EXPO_BY_KEY.australia.visitcountry;

    const payload = {
      name: vipForm.name.value.trim(),
      email: vipForm.email.value.trim().toLowerCase(),
      mobile: vipForm.phone.value.trim(),
      city: selectedUserCity,
      expodate: selectedDate,
      slot: selectedSlot,
      last_investment: selectedUserCity,
      agent: selectedAgent,
      agent_name: selectedAgentName,
      assigned_agent: selectedAgent,
      visitcountry,
      occupation: "Self-Employed",
      interest: selectedCity,
      refer: "",
      eventName: eventValue,
      event_name: eventValue
    };

    const validationError = validateVipPayload(payload);
    if (validationError) {
      setFormFeedback(validationError);
      return;
    }

    if (vipSubmitBtn) {
      vipSubmitBtn.disabled = true;
    }
    startVipSubmitStatusRotation();

    let navigatingAway = false;
    try {
      const response = await fetch(LEAD_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
        priority: "high"
      });

      let responseData = null;
      let rawResponseText = "";
      try {
        rawResponseText = await response.text();
        responseData = rawResponseText ? JSON.parse(rawResponseText) : null;
      } catch (parseError) {
        responseData = null;
      }

      if (!response.ok) {
        const apiMessage = responseData?.message || responseData?.error || rawResponseText || "Lead submission failed.";
        throw new Error(`API ${response.status}: ${apiMessage}`);
      }

      const isSuccess = typeof responseData?.status === "boolean" ? responseData.status : true;
      if (!isSuccess) {
        throw new Error(responseData?.message || "Registration failed.");
      }

      const passNo = responseData?.data?.passno || "";
      const passUrl = getPassUrlFromResponse(responseData);
      const isDubaiEvent = eventValue.includes("Dubai");
      const thankYouPage = isDubaiEvent ? VIP_THANK_YOU_DUBAI : VIP_THANK_YOU_PERTH;
      const thankYouPayload = {
        passNo: String(passNo || "").trim(),
        passUrl: String(passUrl || "").trim(),
        expo: isDubaiEvent ? "dubai" : "perth"
      };

      /* Keep sessionStorage as backup; always put data in the URL so www/apex
         mismatches and strict storage do not drop the pass link. */
      try {
        sessionStorage.setItem("vipThankYou", JSON.stringify(thankYouPayload));
      } catch (storageErr) {
        /* ignore */
      }

      const dest = new URL(thankYouPage, window.location.href);
      dest.searchParams.set("expo", thankYouPayload.expo);
      if (thankYouPayload.passNo) dest.searchParams.set("no", thankYouPayload.passNo);
      const dl = thankYouPayload.passUrl;
      const MAX_DL_IN_QUERY = 1600;
      if (dl && dl.length <= MAX_DL_IN_QUERY) {
        dest.searchParams.set("dl", dl);
      }
      navigatingAway = true;
      window.location.assign(dest.href);
    } catch (error) {
      const message = error?.message || "Something went wrong. Please try again.";
      setFormFeedback(message);
      console.error("VIP lead submission error", {
        endpoint: LEAD_API_URL,
        payload,
        error
      });
    } finally {
      clearVipSubmitStatusRotation();
      if (!navigatingAway && vipSubmitBtn) {
        vipSubmitBtn.disabled = false;
        vipSubmitBtn.textContent = "Claim VIP Pass";
      }
    }
  });

  populateAgentDropdown();

  // --- Hero Slider & Listings Logic ---
  const heroSlides = document.querySelectorAll(".hero-slide");
  const heroDots = document.querySelectorAll(".hero-dot");
  const btnPrev = document.getElementById("hero-prev");
  const btnNext = document.getElementById("hero-next");
  const exploreBtns = document.querySelectorAll(".slide-explore-btn");

  const listingsSection = document.getElementById("listings");
  const listingsGrid = document.getElementById("listings-grid");
  const listingsTitle = document.getElementById("listings-title");

  let currentSlide = 0;
  let slideInterval;

  const propertyData = {
    delhi: [
      { name: "Godrej South Estate", location: "Okhla, New Delhi", price: "INR 6.14 Cr. onwards", possession: "May 2026", bhk: "3 & 4 BHK", badge: "Under Construction", img: "images/977a1e4f-349f-43d9-8aaf-836f73d5e4ff.webp" },
      { name: "Godrej Connaught One", location: "Connaught Place, New Delhi", price: "INR 18.61 Cr. onwards", possession: "May 2025", bhk: "3 BHK", badge: "Under Construction", img: "images/a40702e6-3019-4e58-86d9-a854eceb6590.webp" },
      { name: "Godrej Prima", location: "Okhla, New Delhi", price: "INR 6.14 Cr. onwards", possession: "Jun 2025", bhk: "3 & 4 BHK", badge: "Under Construction", img: "images/Pool-Pan-Cam_1ad984ed8-22a0-4cf6-9fc2-f8e5aa6d4159.webp" },

    ],
    gurgaon: [
      { name: "Godrej Zenith", location: "Sector 89, Gurgaon", price: "INR 5.88 Cr. onwards", possession: "Dec 2030", bhk: "4+ Utility BHK", badge: "Under Construction", img: "images/c0e0f519-f787-48aa-88c9-e5c62dae623b.webp" },
      { name: "Godrej Astra", location: "Sector 54, Gurugram", price: "INR 10.34 Cr. onwards", possession: "Jan 2031", bhk: "3 & 4 BHK", badge: "New Launch", img: "images/e5aa86f4-f70f-46af-b39d-4bd91de720e2.webp" },
      { name: "Godrej Meridien", location: "Sector 106, Gurugram", price: "INR 1.62 Cr. onwards", possession: "Jan 2025", bhk: "1,2 & 3 BHK", badge: "Under Construction", img: "images/44ab5a60-484f-4845-89fb-7a894292b8db.webp" },
      { name: "Godrej Vrikshya", location: "Sector 103, Gurgaon", price: "INR 3.81 Cr. onwards", possession: "Jun 2031", bhk: "3 & 4 BHK", badge: "New Launch", img: "images/bd519108-63a0-431c-9a3a-468ca7d6f366.webp" }
    ],
    noida: [
      { name: "Godrej Arden", location: "Sigma III, Noida", price: "INR 3.46 Cr. onwards", possession: "May 2030", bhk: "3 & 4 BHK", badge: "New Launch", img: "images/550-x550pxl-01-cmli0rqmq000mt5ph32qt71fa.webp" },
      { name: "Godrej Majesty", location: "Sector 12, Noida", price: "INR 3.74 Cr. onwards", possession: "Jan 2030", bhk: "3 & 4 BHK", badge: "New Launch", img: "images/5b5f0906-017d-49ff-8ff1-d9f26655bde8.webp" },
      { name: "Godrej Golf Links", location: "Greater Noida, Noida", price: "INR 4.5 Cr. onwards", possession: "Mar 2024", bhk: "3, 3.5, & 4 BHK", badge: "Under Construction", img: "images/godrej-golf-link.webp" },
      { name: "Godrej Nest", location: "Sector 150, Noida", price: "INR 2.90 Cr. onwards", possession: "Sept 2024", bhk: "3 & 4 BHK", badge: "Under Construction", img: "images/d7bda4d4-2307-4594-86ef-f0d50d8d9048.webp" }
    ],
    mumbai: [
      { name: "Godrej Avenue Eleven", location: "Mahalaxmi, Mumbai", price: "Available on Request", possession: "Dec 2028", bhk: "4 BHK", badge: "Under Construction", img: "images/gallery-01-thumb-cmgqga8n1000a4dph1q8v1zi2.webp" },
      { name: "Godrej Five Garden", location: "Matunga, Mumbai", price: "Available on Request", possession: "Dec 2028", bhk: "3 BHK", badge: "Under Construction", img: "images/matunga-thumbnail-550x550-cmf6iixr70009h3phbiv0dwig.webp" },
      { name: "Godrej Exquisite", location: "Thane , Mumbai", price: "INR 2.35 Cr. onwards", possession: "Sep 2026", bhk: "3 BHK", badge: "Under Construction", img: "images/9142c7e4-3c14-4d83-ac9b-d18aa9717839.webp" },
      { name: "Godrej Horizon", location: "Dadar - Wadala, Mumbai", price: "INR 5.67 Cr. onwards", possession: "june 2027", bhk: "3 BHK", badge: "Under Construction", img: "images/740b4f4c-2297-4f33-87a2-3eda7af4711d.webp" }
    ],
    hyderabad: [
      { name: "Godrej Regal Pavilion", location: "Rajendra Nagar, Hyderabad", price: "INR 1.99 Cr. onwards", possession: "July 2030", bhk: "3 & 4 BHK", badge: "New Launch", img: "images/thumbnail-image-550-x-550-cmeb44mnj0015c8ph41rz3y75.webp" },
      { name: "Godrej Madison Avenue", location: "Kokapet, Hyderabad", price: "INR 2.99 Cr. onwards", possession: "Dec, 2029", bhk: "3 & 4+ BHK", badge: "Under Construction", img: "images/78ec9673-b486-41d2-821c-aaf9db9068b6.webp" },

    ],
    bangalore: [
      { name: "Godrej Aveline", location: "Yelahanka, Bengaluru", price: "INR 2.53 Cr. onwards", possession: "March 2031", bhk: "3, 3.5 & 4.5 BHK", badge: "New Launch", img: "images/aveline-landing-page-final-550-x-550-project-thumbnail-image-cmmoklhge000qv9phgsrt26nt.webp" },
      { name: "Godrej Parkshire", location: "Whitefield- Hoskote​, Bengaluru", price: "INR 1.18 Cr. onwards", possession: "Dec 2030", bhk: "2 & 3 BHK", badge: "New Launch", img: "images/banner-section-550x550-cml7n8sp3000axbor6qdx1rzq-cmlj2m3km000zt5ph8d0j1m7v.webp" },
      { name: "Godrej Woods", location: "THANISANDRA, Bengaluru", price: "INR 1.60 Cr. onwards", possession: "Nov 2030", bhk: "2 & 3 BHK", badge: "New Launch", img: "images/5-cmhlt0fcs0029g3j5f6ji4f9x-cmimy7o9j000gnaph6e3ceksv.webp" },
      { name: "Godrej Tiara", location: "Yeshwanthpur, Bangalore", price: "INR 5.99 Cr. onwards", possession: "May 2030", bhk: "4.5 BHK", badge: "New Launch", img: "images/6b5d387b-d3e0-440d-8ffa-2ea54780551f.webp" }
    ],
    ahmedabad: [
      { name: "Celeste At Godrej Garden City", location: "Godrej Garden City, Ahmedabad", price: "INR 61 L. onwards", possession: "March 2027", bhk: "2 & 3 BHK", badge: "Under Construction", img: "images/ahemdabad.webp" },

    ],
    pune: [
      { name: "Godrej Rejuve", location: "Keshavnagar, Pune", price: "INR 65.74 L. onwards", possession: "Jan 2023", bhk: "2 BHK", badge: "Possession Ready", img: "images/rejuve.webp" },
      { name: "The Gale at Godrej Park World", location: "Hinjawadi Phase 1, Pune", price: "INR 1.09 Cr. onwards", possession: "Mar 2029", bhk: "2 & 3 BHK", badge: "New Launch", img: "images/26c9eaa7-ea55-4cac-8865-090f481a36c3.webp" },
      { name: "Godrej Ivara", location: "Kharadi, Pune", price: "INR 1.25 cr. onwards", possession: "Aug 2032", bhk: "2, 3 & 4 BHK", badge: "New Launch", img: "images/1-elevation-view-cmlz308qv000i0wor1ftgevmg-cmmd38ceg0040cdph88ddfxy8.webp" },
      { name: "Godrej Evergreen Square", location: "Hinjawadi Phase 3, Pune", price: "INR 89.99 L. onwards", possession: "Oct 2030", bhk: "2 & 3 BHK", badge: "New Launch", img: "images/3a5b0678-6b91-46c0-adbb-843aa60303f3.webp" }
    ],
    kolkata: [
      { name: "Godrej Zen Estate", location: "Off-Diamond Harbour Road, Kolkata", price: "INR 45 L. onwards", possession: "Jun 2027", bhk: "Plots", badge: "New Launch", img: "images/fcd3a1a4-2918-463a-8141-bff4fa4a4a24.webp" },
      { name: "Godrej Prakriti", location: "Sodepur, Kolkata", price: "INR 59 L. onwards", possession: "Jan 2026", bhk: "2 & 3 BHK", badge: "Under Construction", img: "images/e7c1a4f6-9187-42b7-a866-d5d8540561ae.webp" },
      { name: "Godrej Blue", location: "BL Saha Road, New Alipore, Kolkata", price: "INR 2.49 cr. onwards", possession: "Sep 2029", bhk: "3 & 4 BHK", badge: "New Launch", img: "images/d2c408b7-90d4-467c-9cad-a6affd72e95a.webp" },
      { name: "Elevate at Godrej Se7en", location: "Joka, Kolkata", price: "INR 56 L. onwards", possession: "Dec 2028", bhk: "2 & 3 BHK", badge: "Under Construction", img: "images/dc0204a4-87cc-43b1-a775-b2b352433436.webp" }
    ]
  };

  // City display names mapping
  const cityNames = { delhi: "Delhi", gurgaon: "Gurgaon", noida: "Noida", mumbai: "Mumbai", hyderabad: "Hyderabad", bangalore: "Bangalore", ahmedabad: "Ahmedabad", pune: "Pune", kolkata: "Kolkata" };

  const populateListings = (city) => {
    if (!listingsGrid || !listingsTitle) return;
    const data = propertyData[city] || [];
    listingsTitle.textContent = `${cityNames[city]} Properties`;

    listingsGrid.innerHTML = data.map(prop => `
      <div class="listing-card">
        <div class="listing-img-wrap">
          <img src="${prop.img}" alt="${prop.name}" class="listing-img">
          <div class="listing-img-overlay">
            <span class="listing-location">${prop.location}</span>
            <button class="listing-plus-btn nri-trigger" title="NRI Exclusive Payment Plan">+</button>
          </div>
        </div>
        <div class="listing-info">
          <h3 class="listing-name">${prop.name}</h3>
          <div class="listing-badge">
            <span class="badge-dot"></span>
            ${prop.badge}
          </div>
          <div class="listing-meta">
            <span class="listing-price">${prop.price}</span>
            <span class="listing-divider">|</span>
            <span class="listing-possession"><strong>Possession Date</strong> ${prop.possession}</span>
          </div>
          <p class="listing-bhk">${prop.bhk}</p>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.nri-trigger').forEach(btn => {
      btn.addEventListener('click', openVipModal);
    });
  };

  const goToSlide = (index) => {
    heroSlides.forEach(s => s.classList.remove("active"));
    heroDots?.forEach(d => d.classList.remove("active"));

    currentSlide = index;
    if (heroSlides[currentSlide]) heroSlides[currentSlide].classList.add("active");
    if (heroDots && heroDots[currentSlide]) heroDots[currentSlide].classList.add("active");
  };

  const nextSlide = () => {
    let next = currentSlide + 1;
    if (next >= heroSlides.length) next = 0;
    goToSlide(next);
  };

  const prevSlide = () => {
    let prev = currentSlide - 1;
    if (prev < 0) prev = heroSlides.length - 1;
    goToSlide(prev);
  };

  const startAutoPlay = () => {
    slideInterval = setInterval(nextSlide, 6000);
  };

  const resetAutoPlay = () => {
    clearInterval(slideInterval);
    startAutoPlay();
  };

  btnNext?.addEventListener("click", () => { nextSlide(); resetAutoPlay(); });
  btnPrev?.addEventListener("click", () => { prevSlide(); resetAutoPlay(); });

  heroDots?.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      goToSlide(index);
      resetAutoPlay();
    });
  });

  exploreBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const slide = e.target.closest('.hero-slide');
      const city = slide.getAttribute('data-city');
      populateListings(city);
      if (listingsSection) {
        window.scrollTo({ top: listingsSection.offsetTop, behavior: 'smooth' });
      }
    });
  });

  // Init
  if (heroSlides.length > 0) {
    const initialCity = document.querySelector(".hero-slide.active")?.getAttribute("data-city") || "mumbai";
    populateListings(initialCity);
    window.addEventListener('load', function () {
      setTimeout(startAutoPlay, 2000);
    });

  }

  // --- Awards Slider ---
  const initAwardsSlider = () => {
    const track = document.getElementById("awards-track"),
      cards = document.querySelectorAll(".award-card"),
      dots = document.querySelectorAll(".award-dot"),
      btnPrev = document.getElementById("awards-prev"),
      btnNext = document.getElementById("awards-next");

    if (!track || !cards.length) return;

    let currentIndex = 0;
    const updateSlider = () => {
      const cardWidth = cards[0].offsetWidth + 32; // width + gap
      track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex);
      });
    };

    btnNext?.addEventListener("click", () => {
      currentIndex = (currentIndex < cards.length - 1) ? currentIndex + 1 : 0;
      updateSlider();
    });

    btnPrev?.addEventListener("click", () => {
      currentIndex = (currentIndex > 0) ? currentIndex - 1 : cards.length - 1;
      updateSlider();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        currentIndex = index;
        updateSlider();
      });
    });

    window.addEventListener("resize", updateSlider);
  };
  initAwardsSlider();


  // --- Countdown Timer Logic ---
  const targetDate = new Date("May 16, 2026 10:00:00").getTime();

  const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      clearInterval(countdownInterval);
      const timerEl = document.getElementById("expo-countdown");
      if (timerEl) timerEl.innerHTML = "<div class='timer-value'>Event Live!</div>";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").textContent = days.toString().padStart(2, "0");
    document.getElementById("hours").textContent = hours.toString().padStart(2, "0");
    document.getElementById("minutes").textContent = minutes.toString().padStart(2, "0");
    document.getElementById("seconds").textContent = seconds.toString().padStart(2, "0");
  };

  // --- Premium Invitation Full Container Slider ---
  // --- Independent Dual Slider System ---
  const initIndependentSliders = () => {
    const invTrack = document.getElementById("invitation-track"),
      invSlides = document.querySelectorAll(".invitation-slide"),
      invPrev = document.getElementById("invitation-prev"),
      invNext = document.getElementById("invitation-next");

    const vipTrack = document.getElementById("vip-track"),
      vipSlides = document.querySelectorAll(".vip-slide"),
      vipPrev = document.getElementById("vip-prev"),
      vipNext = document.getElementById("vip-next");

    const tabs = document.querySelectorAll(".city-tab");

    let invIndex = 0;
    let vipIndex = 0;

    const updateTabs = (index) => {
      tabs.forEach((tab, i) => {
        tab.classList.toggle("active", i === index);
      });
    };

    const updateInv = (index) => {
      invIndex = index;
      if (invTrack) invTrack.style.transform = `translateX(-${invIndex * 100}%)`;
      // When invitation moves, optionally sync VIP or just highlight tab
      updateTabs(invIndex);
    };

    const updateVip = (index) => {
      vipIndex = index;
      if (vipTrack) vipTrack.style.transform = `translateX(-${vipIndex * 100}%)`;
      updateTabs(vipIndex);
    };

    const syncBoth = (index) => {
      updateInv(index);
      updateVip(index);
    };

    // Tab Clicks
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => syncBoth(i));
    });

    // Invitation Nav
    invNext?.addEventListener("click", () => {
      let next = (invIndex < invSlides.length - 1) ? invIndex + 1 : 0;
      updateInv(next);
    });

    invPrev?.addEventListener("click", () => {
      let prev = (invIndex > 0) ? invIndex - 1 : invSlides.length - 1;
      updateInv(prev);
    });

    // VIP Nav
    vipNext?.addEventListener("click", () => {
      let next = (vipIndex < vipSlides.length - 1) ? vipIndex + 1 : 0;
      updateVip(next);
    });

    vipPrev?.addEventListener("click", () => {
      let prev = (vipIndex > 0) ? vipIndex - 1 : vipSlides.length - 1;
      updateVip(prev);
    });

    // Auto-slide invitations only
    setInterval(() => {
      let next = (invIndex < invSlides.length - 1) ? invIndex + 1 : 0;
      updateInv(next);
    }, 12000);
  };

  initIndependentSliders();

  const countdownInterval = setInterval(updateCountdown, 1000);
  updateCountdown(); // Initial call


});

// --- Lightbox Function ---
function openLightbox(src) {
  const modal = document.getElementById('image-modal');
  const img = document.getElementById('lightbox-img');
  if (modal && img) {
    img.src = src;
    modal.classList.add('active');
  }
}
