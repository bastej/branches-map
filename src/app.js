require("./css/style.scss");
// import "./style.css";


import $ from 'jquery';
import "bootstrap/dist/js/bootstrap.min.js";
import MarkerClusterer from "@google/markerclusterer";
// import "bootstrap/js/dist/tooltip.js";
// import _ from "lodash";

// import pdfMake from "pdfmake/build/pdfmake.min.js";
// import pdfFonts from "pdfmake/build/vfs_fonts";
// pdfMake.vfs = pdfFonts.pdfMake.vfs

import { branches } from "./js/branches.js";//przerobić na service
// import lazyLoadScript from "./js/lazyLoader.js";

require("./favicon.ico");
let clock = require("./img/icon_clock.png");
let info = require("./img/icon_info.png");
let locationIc = require("./img/icon_location.png");
let phone = require("./img/icon_phone.png");
let m1 = require("./img/m1.png");
let marker = require("./img/custom_marker.png");
let markerGreen = require("./img/custom_marker_green.png");
let miniLogo = require("./img/minilogo.png");
import loadScript from "./js/lazyLoader.js";

document.addEventListener("DOMContentLoaded", function(event) {
  var APP = (function(hmObj){
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
          errors.push(field.dataset.errorMessage);
        }
      }
      if (formValid) {
        console.log(formValid,errors);
        return true;
      } else {
        console.log(formValid,errors);
        return false;
      }
    }
    
    //download PDF
    function saveToPDF() {
        // lazyLoadScript("pdfmake/build/pdfmake.min.js", "pdfmake/build/vfs_fonts");
        // !pdfMake.vfs && (pdfMake.vfs = pdfFonts.pdfMake.vfs)
          var pdfData = locationsToDisplay.map(element => {
            return {
              unbreakable: true,
              layout: "lightHorizontalLines",
              margin: [5, 2, 10, 20],
              table: {
                widths: [100, 380, "auto", "auto"],
                body: [
                  [
                    { text: "Rodzaj", bold: true },
                    { text: element.rodzaj || "", color: "red", bold: true }
                  ],
                  [{ text: "Adres", bold: true }, `${element.ulica || ""}, ${element.kod_pocztowy || ""}`],
                  [{ text: "godziny otwarcia", bold: true }, element.godziny_otwarcia || ""],
                  [{ text: "tel/fax", bold: true }, `${element.tel || ""} ${element.fax || ""}`],
                  [{ text: "Zakres usług", bold: true }, element.zakres || ""]
                ]
              }
            };
          })
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
            pdfData
          ]
        };
        pdfMake.createPdf(docDefinition).open();
        pdfMake.createPdf(docDefinition).download("Placowki_mBank.pdf");
    }
    $(".row-headBar__btn-pdf").click(saveToPDF);
    

    function toggleListView() {
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
    }
    $("#btn-toggle-view").click(toggleListView);
    

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
    
    ////////////////////////////////////////////////////////
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
    
      renderList(address, range);
    });
    ////////////////////////////////////////////////////////

    async function renderList(address, range) {
      let coordsObj = await changeCityToCoords(address);
      if (coordsObj.data) {
        alert("znaleziono adres");
        locationsToDisplay = calculateDistance(coordsObj.data, branches, range);
      } else {
        alert("nie znaleziono podanego adresu");
        locationsToDisplay = [];
      }
      initMapPlac(locationsToDisplay, coordsObj.data || coordsObj.defaultData, "formInit");
      showInDOM(locationsToDisplay, "#datafetch");
    }


    function showInDOM(locations, outputDiv, listView) {
      var fieldsContainer = document.querySelector(outputDiv);
      var count = 0;// zliczamy liczbe placowek
      for (let k in locations) if (locations.hasOwnProperty(k)) count++;
      // $("#btn-toggle-view").attr("data-active") ? (listView = true) : "";
      $(outputDiv).animate(
        {
          opacity: 0
        },
        100,
        showItems()
      );

      function showItems() {
        // alert("tryb: " + listView)
        var fields = document.createElement("div");

          // $("#btn-toggle-view").attr("data-active", "false");// po wyszukiwaiu domyslny uklad
          locations.map(function(element, index) {
            var field = document.createElement("div");
            var {id, nazwa, rodzaj, godziny_otwarcia, tel, fax, ulica, kod_pocztowy, miasto, zakres} = element;

            !listView ? field.className = "placowki-list__wrapper__field col-md-4 col4" 
                      : field.className = "placowki-list__wrapper__field col-12 card";
            var tooltip =
              `<div>
                <b>Zakres usług:</b>
                <p>${zakres}</p>
              </div>`;
  
            field.innerHTML =
              `${!listView 
                ? `<div data-id="${id}" class="infoBox" data-toggle="tooltip" data-placement="left" data-html="true" title="${tooltip}">`
                : `<div class="card-header" id="h${index}">
                      <a class="btn btn-link collapsed" data-toggle="collapse" data-target="#c${index}" aria-expanded="false" aria-controls="c${index}">
                      <h5>
                        <img class="infoBox__logoImg" src="./${miniLogo}" />
                        ${nazwa}
                      </h5>
                    </a>
                    </div>
                    <div id="c${index}" class="collapse" aria-labelledby="h${index}" data-parent="#accordionExample">
                      <div class="card-body">`
              } 
                <table>
                  <tr class="infoBox__nazwa">
                    <td></td>
                    <td>
                      <span>
                        <b>${rodzaj || "&nbsp"}</b>
                      </span>
                    </td>
                  </tr>
                  <tr class="infoBox__adres">
                    <td>
                      <img class="infoBox__icon" src="./${locationIc}"/>
                    </td>
                    <td>
                      <span>
                        <b>${ulica}</b>, ${kod_pocztowy} ${miasto}
                      </span>
                    </td>
                  </tr>
                  ${godziny_otwarcia && `
                  <tr class="infoBox__otwarcie">
                    <td>
                      <img class="infoBox__icon" src="./${clock}" />
                    </td>
                    <td>
                      <span>
                        ${godziny_otwarcia}
                      </span>
                    </td>
                  </tr>
                  `} 
                  ${tel || fax ? `
                  <tr class="infoBox__tel_fax">
                    <td>
                      <img class="infoBox__icon" src="./${phone}" />
                    </td>
                    <td>
                      <span>
                        tel.: <b>${tel}</b> ${fax && `fax.:<b>${fax}</b>`}
                      </span>
                    </td>
                  </tr>
                  ` : ""}
                  <tr class="infoBox__zakres">
                    <td>
                      <img class="infoBox__icon" src="./${info}"/>
                    </td>
                    <td>
                      <span>
                        <b>Zakres usług
                          <span class="hide-in-DOM">
                            ${zakres}
                          </span>
                        </b>
                      </span>
                    </td>
                  </tr>
                </table>
              ${!listView 
                ? `</div>`
                : `</div>
                </div>`} 
              `;
            fields.appendChild(field);
          });

          setTimeout(function() {
            fieldsContainer.innerHTML = "";
            if(!listView){
              fieldsContainer.innerHTML = fields.innerHTML
              $('[data-toggle="tooltip"]').tooltip({ html: true })
              $(outputDiv).css("opacity", "1");
            } else {
              fieldsContainer.innerHTML = `<div class="accordion col-12" id="accordionExample">${fields.innerHTML}</div>`;
              $(outputDiv).animate({ opacity: 1 }, 300, function() {
                $(".tooltip").css("display", "none");
              });
            }
            $("#itemOutputHeader").html(`Lista oddziałów (${count}):`);
            count === 0 && $("#datafetch").html("<h4>Brak wyników wyszukiwania</h4>");
          }, 300)
      }

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

      return new Promise(resolve => {
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
            resolve ({
              data: obj,
            })
          } else {
            $("#datafetch").html("<h4>Brak wyników wyszukiwania</h4>");
            resolve ({ 
              defaultData: {
                lat: 51.919437,
                lng: 19.145136
              }
            })
          }
        })
      })
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
        ? showInDOM(locationsArray, "#datafetch")
        : "";
    }
    
    window.initMapPlac = initMapPlac;
    
    $("<script/>", {
      type: "text/javascript",
      src:
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyAuav3OQX_e6zpfxBTZIo2o46pW64J2ykE&callback=initMapPlac"
    }).appendTo("body");
  })(APP || {})


})
