import "./css/style.scss";
// import "./style.css";


import $ from 'jquery';
import "bootstrap/dist/js/bootstrap.min.js";
import MarkerClusterer from "@google/markerclusterer";
// import "bootstrap/js/dist/tooltip.js";
// import _ from "lodash";

import pdfMake from "pdfmake/build/pdfmake.min.js";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs

import { branches } from "./js/branches.js";
// import lazyLoadScript from "./js/lazyLoader.js";

import "./favicon.ico"
import clock from "./img/icon_clock.png";
import info from "./img/icon_info.png";
import locationIc from "./img/icon_location.png";
import phone from "./img/icon_phone.png";
import m1 from "./img/m1.png";
import marker from "./img/custom_marker.png";
import markerGreen from "./img/custom_marker_green.png";
import miniLogo from "./img/minilogo.png";
import loadScript from "./js/lazyLoader.js";

$(document).ready(function() {

  var map;
  var locationsToDisplay = [];
  //form validation
  function validateForm(form) {
    var fields = form.querySelectorAll("[required]");
    var errors = [];
    var formValid = validate(errors);
    function validate(errors) {
      //IE support
      for (var i = 0; i < fields.length; i++) {
        validateField(fields[i], errors);
      }
      return !errors.length;
    }
    function validateField(field, errors) {
      var fieldValid = field.validity.valid;
      if (fieldValid) {
        field.nextSibling.nextSibling.innerHTML = "";
        field.classList.remove("invalid");
      } else {
        field.nextSibling.nextSibling.innerHTML = field.dataset.errorMessage;
        field.classList.add("invalid");
        errors.push("error");
      }
    }
    if (formValid) {
      return true;
    } else {
      return false;
    }
  }
  
  //download PDF
  $(".row-headBar__btn-pdf").click(function() {

    // lazyLoadScript("pdfmake/build/pdfmake.min.js", "pdfmake/build/vfs_fonts");
    // !pdfMake.vfs && (pdfMake.vfs = pdfFonts.pdfMake.vfs)

    //widok listy nr1
    if ($("#btn-toggle-view").attr("data-active") === "true") {
      var divToPrint = document.getElementById("accordionExample");
      var test = [].map.call(divToPrint.children, function(element) {
        var rodzaj = element.querySelector(".infoBox__rodzaj b")
            ? element.querySelector(".infoBox__rodzaj b").textContent + "\n"
            : "",
          adres = element.querySelector(".infoBox__adres span")
            ? element.querySelector(".infoBox__adres span").textContent + "\n"
            : "",
          otwarcie = element.querySelector(".infoBox__otwarcie span")
            ? element.querySelector(".infoBox__otwarcie span").textContent + "\n"
            : "",
          tel_fax = element.querySelector(".infoBox__tel_fax span")
            ? element.querySelector(".infoBox__tel_fax span").textContent + "\n"
            : "",
          zakres = element.querySelector(".infoBox__zakres span")
            ? element.querySelector(".infoBox__zakres span").lastChild.lastChild
                .textContent + "\n"
            : "";
  
        return {
          unbreakable: true,
          layout: "lightHorizontalLines",
          margin: [5, 2, 10, 20],
          table: {
            widths: [100, 380, "auto", "auto"],
            body: [
              [
                { text: "Rodzaj", bold: true },
                { text: rodzaj, color: "red", bold: true }
              ],
              [{ text: "Adres", bold: true }, adres],
              [{ text: "godziny otwarcia", bold: true }, otwarcie],
              [{ text: "tel/fax", bold: true }, tel_fax],
              [{ text: "Zakres usług", bold: true }, zakres]
            ]
          }
        };
      });
      //widok listy nr2
    } else {
      var divToPrint = document.getElementById("datafetch");
  
      var test = [].map.call(divToPrint.children, function(element) {
        var nazwa = element.querySelector(".infoBox__nazwa b")
            ? element.querySelector(".infoBox__nazwa b").textContent + "\n"
            : "",
          adres = element.querySelector(".infoBox__adres span")
            ? element.querySelector(".infoBox__adres span").textContent + "\n"
            : "",
          otwarcie = element.querySelector(".infoBox__otwarcie span")
            ? element.querySelector(".infoBox__otwarcie span").textContent + "\n"
            : "",
          tel_fax = element.querySelector(".infoBox__tel_fax span")
            ? element.querySelector(".infoBox__tel_fax span").textContent + "\n"
            : "",
          zakres = element.querySelector(".infoBox__zakres b span")
            ? element.querySelector(".infoBox__zakres b span").textContent + "\n"
            : "";
        return {
          unbreakable: true,
          layout: "lightHorizontalLines",
          margin: [5, 2, 10, 20],
          table: {
            widths: [100, 380, "auto", "auto"],
            body: [
              [
                { text: "Rodzaj", bold: true },
                { text: nazwa, color: "red", bold: true }
              ],
              [{ text: "Adres", bold: true }, adres],
              [{ text: "godziny otwarcia", bold: true }, otwarcie],
              [{ text: "tel/fax", bold: true }, tel_fax],
              [{ text: "Zakres usług", bold: true }, zakres]
            ]
          }
        };
      });
    }
    var docDefinition = {
      content: [
        {
          columns: [
            {
              image:
                "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAeAAD/4QN7aHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjAtYzA2MCA2MS4xMzQ3NzcsIDIwMTAvMDIvMTItMTc6MzI6MDAgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ZmE2OWMwMmUtYjRlZi00MTE4LWFlNWMtYmViZDczMGE1NGE0IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkE3Q0U4NDk3M0QzMzExRTk4RDAwRkY2MjAzMDNDQzQwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkE3Q0U4NDk2M0QzMzExRTk4RDAwRkY2MjAzMDNDQzQwIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmZkYTEwMjY1LWQwNDktMTA0My1hYmVmLTY1ZjljMjFkNTcwNyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGMkQ1MkMxOTY3Q0MxMUU4QTZBRThEMUM1QTI0NUY2QiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEABALCwsMCxAMDBAXDw0PFxsUEBAUGx8XFxcXFx8eFxoaGhoXHh4jJSclIx4vLzMzLy9AQEBAQEBAQEBAQEBAQEABEQ8PERMRFRISFRQRFBEUGhQWFhQaJhoaHBoaJjAjHh4eHiMwKy4nJycuKzU1MDA1NUBAP0BAQEBAQEBAQEBAQP/AABEIACoAMAMBIgACEQEDEQH/xACCAAACAwEAAAAAAAAAAAAAAAAFBgIDBAABAQEBAQEAAAAAAAAAAAAAAAMBBAIFEAACAAQCBwYDCQAAAAAAAAABAgARAwQxBSFhErITczRRMpJUFZVxgRRBkaHxIoIzQ0QRAAEDAgYDAQAAAAAAAAAAAAEAEQIhMVFhcRIDBEGRMkL/2gAMAwEAAhEDEQA/AC2ZZpeteVVp1WpU6bFFVDLu6JmUZfUcw8zV8RiN91txzX3jFGoYxjlKTmpuvOlOW41N8Vp9RzDzNXxGO9RzDzNXxGCVtkiJSZLupTW4rrKihxRu3ETMCru1q2ddqFWW0NIIwIOBEUiYDkn2rKPJEAkmuatTNcwpuHFw7bOnZYzB1EGG+k/EpJUlLbUNL4icIpwh3tOlo8tN0QnASSXKbrSJMgSTZJ991txzX3jFKsUZXGKkEfIzi6+6245r7xiFCrwa1OqVDhGDFTgQPsgTc6rOfo6o5U+jzlqdehX4F7TAkjdoO0Pjp7IFZkb36orenarIAARKRXESlKCrUsrvKozGnWNFLfYNVAspSP6fv1QNze8pXl5xKU+GqhATonKZn+MJOzkhyfBvmyXl+XJDk/k0lmywnCHe06Wjy03RCQcId7TpaPLTdEXguV11by0CUcxRkv7hWEjxGPyJmIzQz5t/KvSYf6O/+UYPboKTOb3Qy27jU3wQlalRVZFYhHltqDoaWE4jBj26O9uiUzUpifSDyJ0DSToAh4t1ZLekjCTKigjWBAex6pOgx/r7/wC3XB2H4GcrR1meTP4X/9k=",
              width: 34,
              height: 30
            },
            {
              text: "Placówki",
              bold: true,
              fontSize: 24,
              margin: [10, 2, 10, 20]
            }
          ]
        },
        test
      ]
    };
    pdfMake.createPdf(docDefinition).open();
    pdfMake.createPdf(docDefinition).download("Placowki_mBank.pdf");
  });
  
  $("#btn-toggle-view").click(function() {
    if (locationsToDisplay.length) {
      if ($(this).attr("data-active") === "false") {
        $(this).animate(
          {
            opacity: 0
          },
          300,
          function() {
            $(this)
              .html('<i class="fa fa-th"></i>')
              .attr("data-active", "true");
            $(this).css("opacity", "1");
          }
        );
        showInDOM(locationsToDisplay, "#datafetch", "change");
      } else {
        $(this).animate(
          {
            opacity: 0
          },
          300,
          function() {
            $(this)
              .html('<i class="fa fa-th-list"></i>')
              .attr("data-active", "false");
            $(this).css("opacity", "1");
          }
        );
        showInDOM(locationsToDisplay, "#datafetch");
      }
    }
  });
  
  //arrow to hide and show form
  // $(".slideForm").click(function() {
  //   if ($(this).attr("data-slide") === "false") {
  //     $(this)
  //       .attr("data-slide", "true")
  //       .css("transform", "rotateX(180deg)");
  //     $(".placowki-filters__wrapper").css("transform", "translateY(205px)");
  //   } else {
  //     $(this)
  //       .attr("data-slide", "false")
  //       .css("transform", "rotateX(0deg)");
  //     $(".placowki-filters__wrapper").css("transform", "translateY(0px)");
  //   }
  // });
  
  document.querySelector("#form").addEventListener("submit", function(e) {
    e.preventDefault();
    if (!validateForm(this)) {
      return false;
    }
    var range = document.querySelector("#rangeField").value;
    var address =
      $("#street").val() +
      ", " +
      $("#city").val() +
      ", " +
      $("#zipcode").val();
  
    changeCityToCoords(address, function(address, status) {
      if (!status) {
        locationsToDisplay = calculateDistance(address, branches, range);
      } else {
        locationsToDisplay = [];
      }
      initMapPlac(locationsToDisplay, address, "formInit");
      showInDOM(locationsToDisplay, "#datafetch");
    });
  });
  
  function showInDOM(locations, result, view, all) {
    var fieldsContainer = document.querySelector(result);
    var count = 0;
    for (let k in locations) if (locations.hasOwnProperty(k)) count++;
  
    $(result).animate(
      {
        opacity: 0
      },
      100,
      function() {
        var fields = document.createElement("div");
        if (!view) {
          $("#btn-toggle-view").attr("data-active", "false");
          //layout listy nr 1
          locations.map(function(element) {
            var field = document.createElement("div");
            field.className = "placowki-list__wrapper__field col-md-4 col4";
            var tooltip =
              "<div>" +
              "<b>" +
              "Zakres usług" +
              ":" +
              "<p>" +
              element.zakres +
              "</p>" +
              "</div>";
  
            var rodzaj = element.rodzaj ? element.rodzaj : "&nbsp";
            var godziny = element.godziny_otwarcia
              ? '<tr class="infoBox__otwarcie">' +
                '<td><img class="infoBox__icon" src="./' +
                clock +
                '" /></td>' +
                "<td><span>" +
                element.godziny_otwarcia +
                "</b></span></td>" +
                "</tr>"
              : "";
            var fax = element.fax ? " fax.: <b>" + element.fax + "</b>" : "";
            var tel =
              element.tel || element.fax
                ? '<tr class="infoBox__tel_fax"><td><img class="infoBox__icon" src="./' +
                  phone +
                  '" /></td><td><span>tel.: <b>' +
                  element.tel +
                  "</b>" +
                  fax +
                  "</span></td></tr>"
                : "";
  
            field.innerHTML =
              '<div data-id="' +
              element.id +
              '" class="infoBox" data-toggle="tooltip" data-placement="left" data-html="true" title="' +
              tooltip +
              '"><table>' +
              '<tr class="infoBox__nazwa"><td></td><td><span><b>' +
              rodzaj +
              "</b></span></td></tr>" +
              '<tr class="infoBox__adres"><td><img class="infoBox__icon" src="./' +
              locationIc +
              '" /></td><td><span><b>' +
              element.ulica +
              "</b>, " +
              element.kod_pocztowy +
              " " +
              element.miasto +
              "</span></td></tr>" +
              godziny +
              tel +
              '<tr class="infoBox__zakres"><td><img class="infoBox__icon" src="./' +
              info +
              '" /></td><td><span><b>' +
              "Zakres usług" +
              ' <span class="hide-in-DOM">' +
              element.zakres +
              "</span></b></span></td></tr>" +
              "</table></div>";
            fields.appendChild(field);
          });
  
          setTimeout(function() {
            fieldsContainer.innerHTML = "";
            fieldsContainer.innerHTML = fields.innerHTML;
            $('[data-toggle="tooltip"]').tooltip({ html: true })
            $(result).css("opacity", "1");
            $("#itemOutputHeader").html("Lista oddziałów" + "(" + count + "):");
            if (count === 0) {
              $("#datafetch").html("<h4>Brak wyników wyszukiwania</h4>");
            }
          }, 300);
        } else {
          //layout listy nr2
          locations.map(function(element, index) {
            var field = document.createElement("div");
            field.className = "placowki-list__wrapper__field col-12 card";
  
            var rodzaj = element.rodzaj ? element.rodzaj : "&nbsp";
            var godziny = element.godziny_otwarcia
              ? '<tr class="infoBox__otwarcie">' +
                '<td><img class="infoBox__icon" src="./' +
                clock +
                '" /></td>' +
                "<td><span>" +
                element.godziny_otwarcia +
                "</b></span></td>" +
                "</tr>"
              : "";
            var fax = element.fax ? " fax.: <b>" + element.fax + "</b>" : "";
            var tel =
              element.tel || element.fax
                ? '<tr class="infoBox__tel_fax"><td><img class="infoBox__icon" src="./' +
                  phone +
                  '" /></td><td><span>tel.: <b>' +
                  element.tel +
                  "</b>" +
                  fax +
                  "</span></td></tr>"
                : "";
  
            field.innerHTML =
              '<div class="card-header" id="h' +
              index +
              '">' +
              '<a class="btn btn-link collapsed" data-toggle="collapse" data-target="#c' +
              index +
              '" aria-expanded="false" aria-controls="c' +
              index +
              '">' +
              '<h5><img class="infoBox__logoImg" src="./' +
              miniLogo +
              '" />' +
              element.nazwa +
              "</h5>" +
              "</a>" +
              "</div>" +
              '<div id="c' +
              index +
              '" class="collapse" aria-labelledby="h' +
              index +
              '" data-parent="#accordionExample"><div class="card-body">' +
              '<div class="infoBox"><table>' +
              '<tr class="infoBox__rodzaj"><td></td><td><span><b>' +
              rodzaj +
              "</b></span></td></tr>" +
              '<tr class="infoBox__adres"><td><img class="infoBox__icon" src="./' +
              locationIc +
              '" /></td><td><span><b>' +
              element.ulica +
              "</b>, " +
              element.kod_pocztowy +
              " " +
              element.miasto +
              "</span></td></tr>" +
              godziny +
              tel +
              '<tr class="infoBox__zakres"><td><img class="infoBox__icon" src="./' +
              info +
              '" /></td><td><span><b>' +
              "Zakres usług" +
              "<b>: </b>" +
              element.zakres +
              "</span></td></tr>" +
              "</div>" +
              "</table>" +
              "</div></div>";
            fields.appendChild(field);
          });
          setTimeout(function() {
            fieldsContainer.innerHTML = "";
            fieldsContainer.innerHTML =
              '<div class="accordion col-12" id="accordionExample">' +
              fields.innerHTML +
              "</div>";
            $(result).animate({ opacity: 1 }, 300, function() {
              $(".tooltip").css("display", "none");
            });
            $("#itemOutputHeader").html("Lista oddziałów" + "(" + count + "):");
          }, 300);
        }
      }
    );
  }
  
  function calculateDistance(startPoint, allLocation, range) {
    if (!range) {
      return allLocation;
    }
    var locationToShow = allLocation.filter(function(singleLocation) {
      var p = 0.017453292519943295;
      return (
        12742 *
          Math.asin(
            Math.sqrt(
              0.5 -
                Math.cos((startPoint.lat - singleLocation.lat) * p) / 2 +
                (Math.cos(singleLocation.lat * p) *
                  Math.cos(startPoint.lat * p) *
                  (1 - Math.cos((startPoint.lng - singleLocation.lng) * p))) /
                  2
            )
          ) <
        range
      );
    });
    return locationToShow.length > 0 ? locationToShow : [];
  }
  
  function changeCityToCoords(address, callback) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, function(results, status) {
      var obj;
  
      if (status === google.maps.GeocoderStatus.OK) {
        var latitude = results[0].geometry.location.lat();
        var longitude = results[0].geometry.location.lng();
        obj = {
          lat: latitude,
          lng: longitude
        };
        callback(obj);
      } else {
        $("#datafetch").html("<h4>Brak wyników wyszukiwania</h4>");
        callback({ lat: 51.919437, lng: 19.145136 }, "ZERO_RESULTS");
      }
    });
  }
  
  function initMapPlac(locationsArray, location, controller) {
    if (!locationsArray) locationsArray = branches;
    if (!location) location = { lat: 51.919437, lng: 19.145136 };
    if (!controller) controller = "autoInit";
  
    $("#datafetch").html('<div class="lds-dual-ring"></div>');
  
    controller === "autoInit" ? (locationsToDisplay = locationsArray) : "";
  
    map = new google.maps.Map(document.getElementById("map"), {
      center: location
        ? { lat: location.lat, lng: location.lng }
        : { lat: 51.919437, lng: 19.145136 },
      zoom: 6
    });
  
    map.addListener("mousemove", function() {
      $(".placowki-filters__wrapper").css("transform", "translateY(280px)");
    });
    map.addListener("mouseout", function() {
      $(".placowki-filters__wrapper").css("transform", "translateY(0px)");
    });
  
    var markersTest = [];
    var infoWindow = null;
    function markersMaker(locationsArray) {
      locationsArray.map(function(singleLocation, index) {
        markersTest.push(
          new google.maps.Marker({
            position: new google.maps.LatLng(
              singleLocation.lat,
              singleLocation.lng
            ),
            map: map,
            visible: false,
            icon: "./" + marker,
            id: singleLocation.id
          })
        );
        google.maps.event.addListener(map, "click", function() {
          infoWindow ? infoWindow.close() : "";
          //IE support
          for (var i = 0; i < markersTest.length; i++) {
            markersTest[i].setIcon("./" + marker);
          }
        });
        google.maps.event.addListener(markersTest[index], "click", function() {
          infoWindow ? infoWindow.close() : "";
          //IE support
          for (var i = 0; i < markersTest.length; i++) {
            infoWindow = new google.maps.InfoWindow(/*{pixelOffset: new google.maps.Size(200,0)}*/);
            markersTest[i].setIcon("./" + marker);
          }
          this.setIcon("./" + markerGreen);
  
          var otwarcie = singleLocation.godziny_otwarcia
            ? '<tr class="infoBox__otwarcie"><td><img class="infoBox__icon" src="./' +
              clock +
              '" /></td><td><span>' +
              singleLocation.godziny_otwarcia +
              "</b></span></td></tr>"
            : "";
          var tel = singleLocation.tel
            ? "tel.: <b>" + singleLocation.tel + "</b>"
            : "";
          var fax = singleLocation.fax
            ? " fax.: <b>" + singleLocation.fax + "</b>"
            : "";
          var tel_fax =
            singleLocation.tel || singleLocation.fax
              ? '<tr class="infoBox__tel_fax"><td><img class="infoBox__icon" src="./' +
                phone +
                '" /></td><td><span>' +
                tel +
                fax +
                "</span></td></tr>"
              : "";
  
          infoWindow.setContent(
            '<table class="infoBox">' +
              '<tr class="infoBox__nazwa"><td></td><td><span><b>' +
              singleLocation.rodzaj +
              "</b></span></td></tr>" +
              '<tr class="infoBox__adres"><td><img class="infoBox__icon" src="./' +
              locationIc +
              '" /></td><td><span><b>' +
              singleLocation.ulica +
              "</b>, " +
              singleLocation.kod_pocztowy +
              " " +
              singleLocation.miasto +
              "</span></td></tr>" +
              otwarcie +
              tel_fax +
              '<tr class="infoBox__zakres"><td><img class="infoBox__icon" src="./' +
              info +
              '" /></td><td><span><b>' +
              singleLocation.zakres +
              "</b></span></td></tr>" +
              "</table>"
          );
          infoWindow.open(map, markersTest[index]);
        });
      });
    }
    locationsArray.length ? markersMaker(locationsArray) : "";
  
    function showVisible() {
      var bounds = new google.maps.LatLngBounds();
  
      for (var i = 0; i < markersTest.length; i++) {
        markersTest[i].setVisible(true);
        bounds.extend(markersTest[i].getPosition());
      }
      map.fitBounds(bounds);
    }
    markersTest.length ? showVisible() : "";
  
    var config = {
      styles: [
        {
          url: "./" + m1,
          height: 53,
          width: 53,
          textSize: 15,
          textColor: "#ffffff"
        }
      ]
    };
    if (markersTest.length) {
      var markerCluster = new MarkerClusterer(map, markersTest, config);
    }
    controller === "autoInit"
      ? showInDOM(locationsArray, "#datafetch", false, true)
      : "";
  }
  
  window.initMapPlac = initMapPlac;
  
  $("<script/>", {
    type: "text/javascript",
    src:
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyAuav3OQX_e6zpfxBTZIo2o46pW64J2ykE&callback=initMapPlac"
  }).appendTo("body");
  
  // $("<script/>", {
  //   type: "text/javascript",
  //   src:
  //     "https://cdn.rawgit.com/googlemaps/js-marker-clusterer/gh-pages/src/markerclusterer.js"
  // }).appendTo("body");

})


// $("<script/>", {
//   type: "text/javascript",
//   src:
//     "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js"
// }).appendTo("body");

// $("<script/>", {
//   type: "text/javascript",
//   src:
//     "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/js/bootstrap.min.js"
// }).appendTo("body");