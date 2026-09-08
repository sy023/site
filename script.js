(function ($) {
  "use strict";

  var displayBoot = true;
  var crtEffect = true;
  var ambientSound = false;

  // IE11 forEach polyfill
  if (
    typeof NodeList !== "undefined" &&
    NodeList.prototype &&
    !NodeList.prototype.forEach
  ) {
    NodeList.prototype.forEach = Array.prototype.forEach;
  }

  // Google Analytics Custom Events
  var gaCustomEventTrigger = document.querySelectorAll(".ga-ce");

  gaCustomEventTrigger.forEach(function (e) {
    e.addEventListener("click", function () {
      var category = this.dataset.category || null;
      var action = this.dataset.action || null;
      var label = this.dataset.label || null;
      var value = this.dataset.value || 1;

      if (window.ga && ga.create) {
        ga("send", "event", category, action, label, value, null);
      }
    });
  });

  // Share popups
  var sharePopups = {
    triggers: $(".share-popup"),

    init: function () {
      var self = this;

      self.triggers.on("click", function (e) {
        e.preventDefault();
        self.popup($(this).attr("href"));
      });
    },

    popup: function (target) {
      var popupWindow = window.open(
        target,
        "",
        "width=600,height=400"
      );

      if (popupWindow) {
        popupWindow.focus();
      }
    },
  };

  sharePopups.init();

  // SYSTEM
  var system = {
    view: $(".screen"),
    bios: $(".screen .bios"),
    started: false,

    loading: {
      audio: false,
      video: false,
    },

    ambientAudio: new Audio("sound/ambient.mp3"),
    audioPlayer: document.createElement("audio"),

    text: [
      "<p>PAPOI OS</p>" +
        "<p>Copyright (c) 2003, 2004. All Rights Reserved</p>" +
        "<p>BIOS Version: 2069420 Release 1</p>" +
        "<br />",

      "<p>Battery Pack: 98% OK</p>",

      "<p>Memory Test: 050104/020203 OK</p>",

      "<p>Initializing USB Controllers ... Done</p>",

      "<br />" +
        "<p>Hello, Aquarius Hater</p>",

      "<br /><br />",

      "<p>Press Any Key to boot system</p>",
    ],

    init: function () {
      var self = this;

      self.setBodyHeight();

      var agent = navigator.userAgent.toLowerCase();
      self.isIPhone = agent.indexOf("iphone") !== -1;

      self.displayTime();

      setTimeout(function () {
        self.boot();
      }, 100);

      // Media session
      if ("mediaSession" in navigator) {
        try {
          navigator.mediaSession.setActionHandler("play", function () {
            self.resumeTrack();
          });

          navigator.mediaSession.setActionHandler("pause", function () {
            self.pauseTrack();
          });

          navigator.mediaSession.setActionHandler("stop", function () {
            self.stopTrack();
          });

          navigator.mediaSession.setActionHandler("seekto", function (details) {
            if (details.seekTime !== undefined) {
              self.audioPlayer.currentTime = details.seekTime;
            }
          });
        } catch (error) {
          console.log("Media session actions are not supported.");
        }
      }

      // START / SHOW LOGIN
      $(window).on("keyup click", function () {
        if (!system.started) {
          self.bios.hide();
          self.setLoading(true);

          setTimeout(function () {
            // IMPORTANT:
            // .show() removes the inline display:none problem
            $(".login").show().addClass("loaded");

            var passwordInput = $(".login input[type='password']");
            if (passwordInput.length) {
              passwordInput.trigger("focus");
            }

            self.setLoading(false);
          }, 1500);

          if (ambientSound && !self.isIPhone) {
            var audioPromise = self.ambientAudio.play();

            if (audioPromise !== undefined) {
              audioPromise.catch(function () {
                console.log("Ambient audio was blocked by the browser.");
              });
            }

            $(self.ambientAudio).animate(
              {
                volume: 0.2,
              },
              3000
            );
          }

          system.started = true;
        }
      });

      self.ambientAudio.loop = true;
      self.ambientAudio.volume = 0;

      self.ambientAudio.addEventListener("timeupdate", function () {
        var buffer = 0.44;

        if (
          this.duration &&
          this.currentTime > this.duration - buffer
        ) {
          this.currentTime = 0;
          this.play();
        }
      });

      $(self.audioPlayer).on("ended", function () {
        self.stopTrack();
      });

      $(self.audioPlayer).on("stalled", function () {
        console.log("audio stalled");
        this.load();
      });

      $("#video").on("stalled", function () {
        console.log("video stalled");
        this.load();
      });
    },

    setBodyHeight: function () {
      $("body").css("height", window.innerHeight);

      setTimeout(function () {
        system.setBodyHeight();
      }, 100);
    },

    setLoading: function (state) {
      if (state) {
        $("body").addClass("loading");
      } else {
        $("body").removeClass("loading");
      }
    },

    formatAMPM: function (date) {
      var monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      var hours = date.getHours();
      var minutes = date.getMinutes();

      var ampm = hours >= 12 ? "PM" : "AM";

      hours = hours % 12;
      hours = hours ? hours : 12;

      minutes = minutes < 10 ? "0" + minutes : minutes;

      return (
        hours +
        ":" +
        minutes +
        ampm +
        "<span> - " +
        monthNames[date.getMonth()] +
        ". " +
        date.getDate() +
        ", 2069</span>"
      );
    },

    displayTime: function () {
      var time = this.formatAMPM(new Date());

      $("#time").html(time);

      setTimeout(function () {
        system.displayTime();
      }, 1000);
    },

    boot: function () {
      var self = this;

      if (self.isIPhone) {
        $(".hide-on-ios").hide();
      }

      if (crtEffect) {
        $("body").addClass("crt");
      }

      if (!displayBoot) {
        self.bios.hide();
        $(".login").hide();
      } else {
        self.view.fadeIn(100, function () {
          $.each(self.text, function (i, e) {
            setTimeout(function () {
              self.bios.append(e);
            }, i * 700);
          });
        });
      }
    },

    toggleAmbientSound: function (status) {
      if (status) {
        $(this.ambientAudio).animate(
          {
            volume: 0.2,
          },
          3000
        );
      } else {
        $(this.ambientAudio).animate(
          {
            volume: 0,
          },
          8000
        );
      }
    },

    loadTrack: function (item) {
      var self = this;

      self.loading.video = false;
      self.loading.audio = false;

      self.setLoading(true);

      $(self.audioPlayer).on("canplay", function () {
        self.playTrack("audio");
      });

      $("#video").on("canplay", function () {
        self.playTrack("video");
      });

      self.playingTrack = item;

      item.addClass("active playing");

      var track = item.attr("data-sound");
      var video = item.attr("data-video");
      var title = item.attr("data-title");
      var album = item.attr("data-album");

      $("#video .mpeg").attr(
        "src",
        "video/" + video + ".mp4"
      );

      $("#video .webm").attr(
        "src",
        "video/" + video + ".webm"
      );

      $("#video").get(0).load();

      self.audioPlayer.src = "sound/" + track;
      self.audioPlayer.load();

      if ("mediaSession" in navigator) {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: title,
            artist: "Toasty Digital",
            album: album,
            artwork: [
              {
                src: "img/cover/" + album + "_96x96.png",
                sizes: "96x96",
                type: "image/png",
              },
              {
                src: "img/cover/" + album + "_128x128.png",
                sizes: "128x128",
                type: "image/png",
              },
              {
                src: "img/cover/" + album + "_192x192.png",
                sizes: "192x192",
                type: "image/png",
              },
              {
                src: "img/cover/" + album + "_256x256.png",
                sizes: "256x256",
                type: "image/png",
              },
              {
                src: "img/cover/" + album + "_384x384.png",
                sizes: "384x384",
                type: "image/png",
              },
              {
                src: "img/cover/" + album + "_512x512.png",
                sizes: "512x512",
                type: "image/png",
              },
            ],
          });
        } catch (error) {
          console.log("Media metadata unavailable.");
        }
      }
    },

    playTrack: function (media) {
      var self = this;

      if (media === "audio") {
        self.loading.audio = true;
      }

      if (media === "video") {
        self.loading.video = true;
      }

      if (self.loading.audio && self.loading.video) {
        self.setLoading(false);

        self.resumeTrack();

        $("body").addClass("media-playing");

        if ("mediaSession" in navigator) {
          navigator.mediaSession.playbackState = "playing";
        }
      }
    },

    stopTrack: function () {
      var self = this;

      $(self.audioPlayer).off("canplay");
      $("#video").off("canplay");

      $("body").removeClass("media-playing");

      $("#video").stop(true, true).fadeOut(800);

      setTimeout(function () {
        $("#video").get(0).pause();
      }, 800);

      self.audioPlayer.pause();

      if (self.playingTrack) {
        self.playingTrack.removeClass("active playing");
      }

      if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "paused";
      }
    },

    pauseTrack: function () {
      $("#video").get(0).pause();
      this.audioPlayer.pause();

      if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "paused";
      }
    },

    resumeTrack: function () {
      var self = this;

      $("#video").stop(true, true).fadeIn(800);

      var video = $("#video").get(0);

      if (video) {
        var videoPromise = video.play();

        if (videoPromise !== undefined) {
          videoPromise.catch(function () {});
        }
      }

      var audioPromise = self.audioPlayer.play();

      if (audioPromise !== undefined) {
        audioPromise.catch(function () {});
      }
    },
  };

  system.init();

  // FORGOT PASSWORD HINT
  $(".login .hint a").on("click", function (e) {
    e.preventDefault();

    $(this).parent(".hint").find("a").hide();
    $(this).parent(".hint").find("span").show();
  });

  // PASSWORD LOGIN
  $(".login form").on("submit", function (e) {
    e.preventDefault();

    var answers = [
      "aSBsb3ZlIHlvdQ==",
      "aWx5",
    ];

    var input = $(this).find("input[type='password']");
    var value = input.val().trim().toLowerCase();

    var encodedValue = btoa(value);

    if (answers.includes(encodedValue)) {
      $(".login").removeClass("loaded");

      setTimeout(function () {
        $(".login").hide();

        system.toggleAmbientSound(false);
        system.setLoading(false);
      }, 1800);
    } else {
      input.val("");

      // Small visual feedback
      input.trigger("focus");
    }
  });

  // NAVIGATION
  $(".navbar .item.submenu button").on("click", function (e) {
    e.stopPropagation();

    if (!$(this).parent(".submenu").hasClass("active")) {
      $(".navbar .item.submenu.active").removeClass("active");
      $(this).parent(".submenu").addClass("active");
    } else {
      $(".navbar .item.submenu.active").removeClass("active");
    }
  });

  $("body").on("click", function (e) {
    if (
      $(e.target).closest(".item.submenu.active").length <= 0
    ) {
      $(".navbar .item.submenu.active").removeClass("active");
    }

    if (
      $(e.target).closest(".dialog, .navbar").length <= 0
    ) {
      $(".dialog").css("display", "none").html("");
    }

    $(".file").removeClass("active");
  });

  $(".disabled").on("click", function (e) {
    e.preventDefault();
  });

  // ABOUT
  $("#about").on("click", function (e) {
    e.preventDefault();

    $(".navbar .item.submenu.active").removeClass("active");

    var content =
      "<div><p>Lupet no, kinilig ka ba?<br />" +
      'Made by <a href="https://abos.carrd.co" target="_blank">yours</a> truly.</p></div>';

    $(".dialog").html(content).css("display", "flex");
  });

  // BATTERY
  $("#battery").on("click", function (e) {
    e.preventDefault();

    $(".navbar .item.submenu.active").removeClass("active");

    var content =
      "<div><p>Battery power is charged with coffee, cuddles, food, and lots of kisses. Please charge whenever possible or owner may die a horrible death.<br><br>" +
      "Do not attempt to replace, you have been warned.</p></div>";

    $(".dialog").html(content).css("display", "flex");
  });

  // FULLSCREEN
  $("#fullscreen").on("click", function (e) {
    e.preventDefault();

    $(".navbar .item.submenu.active").removeClass("active");

    var elem = document.documentElement;

    if ($("body").hasClass("fullscreen")) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }

      $("body").removeClass("fullscreen");
    } else {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }

      $("body").addClass("fullscreen");
    }
  });

  // RESTART
  $("#restart").on("click", function (e) {
    e.preventDefault();
    location.reload();
  });

  // PRINT
  $("#print").on("click", function (e) {
    e.preventDefault();

    $(".navbar .item.submenu.active").removeClass("active");

    window.print();
  });

  // SHOW HIDDEN FILES
  $("#switchfiles").on("click", function (e) {
    e.preventDefault();

    $(".navbar .item.submenu.active").removeClass("active");

    $(this).toggleClass("invert");
    $("body").toggleClass("show-hidden-files");
  });

  // FOLDERS
  $("#folder1").on("click", function (e) {
    e.preventDefault();

    $(".finder").removeClass("focus");
    $(".finder.2k49").addClass("focus").show("slow");

    $(this).addClass("active");
  });

  $("#folder2").on("click", function (e) {
    e.preventDefault();

    $(".finder").removeClass("focus");
    $(".finder.gktfolder").addClass("focus").show("slow");

    $(this).addClass("active");
  });

  $("#folder3").on("click", function (e) {
    e.preventDefault();

    $(".finder").removeClass("focus");
    $(".finder.blondafolder").addClass("focus").show("slow");

    $(this).addClass("active");
  });

  $("#folder4").on("click", function (e) {
    e.preventDefault();

    $(".finder").removeClass("focus");

    $(this).addClass("active");

    var content =
      "<div><p>File corrupted!<br />Please download it again.</p></div>";

    $(".dialog").html(content).css("display", "flex");
  });

  $("#folder5").on("click", function (e) {
    e.preventDefault();

    $(".finder").removeClass("focus");
    $(".finder.journal").addClass("focus").show("slow");

    $(this).addClass("active");
  });

  // LIZARD
  $("#lizard").on("click", function (e) {
    e.preventDefault();

    var video = $("#video2").get(0);

    if (video) {
      var promise = video.play();

      if (promise !== undefined) {
        promise.catch(function () {});
      }
    }

    $(".finder.fdl").addClass("focus").show();
  });

  // README
  $("#readme").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    $(".finder.readme").addClass("focus").show("slow");
  });

  // EARTH
  $("#earththt").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    $(".finder.earth").addClass("focus").show("slow");
  });

  // JOURNAL ENTRIES (works for any current or future entry button
  // that has a data-target matching a ".finder.journal-entry.<target>" window)
  $(".journal-entry-btn").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    var target = $(this).data("target");

    $(".finder").removeClass("focus");
    $(".finder." + target).addClass("focus").show("slow");
  });

  // CLOSE FINDERS
  $(".finder .close").on("click", function (e) {
    e.preventDefault();

    $(this).closest(".finder").hide();
  });

  // PLAY TRACK
  $(".play-track").on("click", function (e) {
    e.preventDefault();

    var item = $(this);

    if (!item.hasClass("playing")) {
      system.setLoading(true);

      if (system.playingTrack) {
        system.stopTrack();

        setTimeout(function () {
          system.loadTrack(item);
        }, 800);
      } else {
        system.loadTrack(item);
      }
    }
  });

  // PAUSE
  $("#pause").on("click", function (e) {
    e.preventDefault();

    if (system.audioPlayer.paused) {
      $(this).removeClass("invert");
      system.resumeTrack();
    } else {
      $(this).addClass("invert");
      system.pauseTrack();
    }
  });

  // STOP
  $("#stop").on("click", function (e) {
    e.preventDefault();

    $("body").removeClass("media-playing");

    system.stopTrack();
  });

  // FINDER FOCUS
  $(".finder").on("mousedown click", function () {
    $(".finder.focus").removeClass("focus");
    $(this).addClass("focus");
  });

  // DRAGGABLE FINDERS
  $(".finder").each(function (i, e) {
    dragElement(e);
  });

  function dragElement(elmnt) {
    var pos1 = 0;
    var pos2 = 0;
    var pos3 = 0;
    var pos4 = 0;

    if ($(elmnt).find(".header").get(0)) {
      $(elmnt).find(".header").get(0).onmousedown = dragMouseDown;
      $(elmnt).find(".header").get(0).ontouchstart = dragMouseDown;
    } else {
      elmnt.onmousedown = dragMouseDown;
      elmnt.ontouchstart = dragMouseDown;
    }

    function dragMouseDown(e) {
      e = e || window.event;

      if (e.touches) {
        pos3 = e.touches[0].pageX;
        pos4 = e.touches[0].pageY;
      } else {
        pos3 = e.clientX;
        pos4 = e.clientY;
      }

      document.onmouseup = closeDragElement;
      document.ontouchend = closeDragElement;

      document.onmousemove = elementDrag;
      document.ontouchmove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;

      if (e.cancelable) {
        e.preventDefault();
      }

      var clientX;
      var clientY;

      if (e.touches) {
        clientX = e.touches[0].pageX;
        clientY = e.touches[0].pageY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      pos1 = pos3 - clientX;
      pos2 = pos4 - clientY;

      pos3 = clientX;
      pos4 = clientY;

      var posY =
        elmnt.offsetTop - pos2 >= 28
          ? elmnt.offsetTop - pos2
          : 28;

      var posX =
        elmnt.offsetLeft - pos1 >= 0
          ? elmnt.offsetLeft - pos1
          : 0;

      elmnt.style.top = posY + "px";
      elmnt.style.left = posX + "px";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.ontouchend = null;
      document.onmousemove = null;
      document.ontouchmove = null;
    }
  }
})(jQuery);