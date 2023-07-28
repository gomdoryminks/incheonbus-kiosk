//전역변수
let touchTimer;
var map;

//create deferred object
let YTdeferred = $.Deferred();

window.onYouTubeIframeAPIReady = function() {
    //resolve when youtube callback is called
    //passing YT as a parameter
    YTdeferred.resolve(window.YT);
}

$(function() {
    //하단 탭 클릭시
    $(".map-main-tab-list>li").click(function() {
        let dataTabType = $(this).attr("data-tab-type");
        
        if (dataTabType == "mapView") {
            //실시간 버스 현황 보기
            setMapInit();
        } else if (dataTabType == "routeSearch") {
            //노선검색창 열기
            openMapRouteLayer();
        }
    });
    
    //우측 하단 메뉴 클릭시
    $(".map-main-menu-list>li .menu-item").click(function() {
        let dataMenuType = $(this).parent("li").attr("data-menu-type");
        
        if (dataMenuType == "language") {
            //언어 종류 보이기&숨기기
            if ($(this).hasClass("on")) {
                $(this).removeClass("on");
            } else {
                $(this).addClass("on");
            }
        } else if (dataMenuType == "weakPedestrian") {
            //교통약자창 열기
            openWeakPedestrianLayer();
        }
    });
    
    //언어 종류 클릭시
    $(".language-list>li .language-item").click(function() {
        let dataLanguageType = $(this).parent("li").attr("data-language-type");
        
        $(".wrap").attr("data-language", dataLanguageType);
    });
    
    //화면터치시
    $(".wrap").on("click touchstart", function(e) {
        clearInterval(touchTimer);
        
        touchTimer = setInterval(function() {
            //일정시간 화면터치가 없을 경우 화면 초기화 (5분)
            setNotTouchInit();
        }, 300000);
    });
    
    //지도영역 터치시 화면터치 안내창 닫기
    $(".c-wrap .c-map .map-main-area").on("click touchstart", function(e) {
        $("#map-main-touch-layer").removeClass("on");
    });
    
    //실시간 날짜 및 시간 설정
    setDateTime();
    
    setInterval(function() {
        //실시간 날짜 및 시간 설정
        setDateTime();
    }, 1000);
    
    //일정시간 화면터치가 없을 경우 화면 초기화
    setNotTouchInit();
    
    //좌측에 잠시 후 도착 버스 슬라이드 설정
    setArriveSlide();
    
    //교통약자창에 잠시 후 도착 버스 슬라이드 설정
    setArriveSlide2();
    
    //시정소식 슬라이드 설정
    setNewsSlide();
    
    //서비스 점검창 열기
    //openInspectionLayer();
    
    //mapInit
    mapInit();
});

$(window).load(function() {
    //상단 도착 알림 목록 설정
    setArriveFlow();
});

//실시간 날짜 및 시간 설정
function setDateTime() {
    let todayDate = new Date();
    let todayYear = todayDate.getFullYear();
    let todayMonth = ("0" + (todayDate.getMonth() + 1)).slice(-2);
    let todayDay = ("0" + todayDate.getDate()).slice(-2);
    let todayWeek = todayDate.getDay();
    let todayHour = ("0" + todayDate.getHours()).slice(-2);
    let todayMinute = ("0" + todayDate.getMinutes()).slice(-2);
    let weekArr = ['일', '월', '화', '수', '목', '금', '토'];

    $(".h-today-date").text(todayYear + "." + todayMonth + "." + todayDay + "(" + weekArr[todayWeek] + ")");
    $(".h-today-time").text(todayHour + ":" + todayMinute);
}

//일정시간 화면터치가 없을 경우 화면 초기화
function setNotTouchInit() {
    if ($("#weak-pedestrian-layer.on").length > 0) {
        //잠시 후 도착 버스창으로 이동하기
        moveLayer('','vWplMain');
    } else {
        //실시간 버스 현황 보기
        setMapInit();

        //화면터치 안내창 열기
        openMapTouchLayer();
    }
}

//상단 도착 알림 목록 설정
function setArriveFlow() {
    let $wrap = $(".map-top-arrive-area");
    let $list = $(".map-top-arrive-area .map-top-arrive-list");
    let wrapWidth = '';
    let listWidth = '';
    let speed = 100;
    let timer;
    
    arriveFlowAction();
    
    //실행 함수
    function arriveFlowAction() {
        clearInterval(timer);
        
        //데이터 가져오기 (skyblue-item : 간선버스, red-item : 광역버스, red-item + red2-item : 공항버스, green-item : 지선버스, green-item + green2-item : 마을버스, blue-item : 급행버스, orange-item : 좌석버스)
        let listHtml = `
            <li class="skyblue-item">
                <div class="number">${arriveFlowText('9')}</div>
                <div class="minute">잠시 후</div>
            </li>
            <li class="red-item">
                <div class="number">${arriveFlowText('M6450')}</div>
                <div class="minute">2분 후</div>
            </li>
            <li class="green-item">
                <div class="number">${arriveFlowText('순환 43')}</div>
                <div class="minute">2분 후</div>
            </li>
            <li class="blue-item">
                <div class="number">${arriveFlowText('급행 91')}</div>
                <div class="minute">3분 후</div>
            </li>
            <li class="orange-item">
                <div class="number">${arriveFlowText('303-1')}</div>
                <div class="minute">5분 후</div>
            </li>
            <li class="skyblue-item">
                <div class="number">${arriveFlowText('9')}</div>
                <div class="minute">7분 후</div>
            </li>
            <li class="red-item">
                <div class="number">${arriveFlowText('M6450')}</div>
                <div class="minute">9분 후</div>
            </li>
            <li class="green-item">
                <div class="number">${arriveFlowText('순환 43')}</div>
                <div class="minute">10분 후</div>
            </li>
        `;
        
        $list.html(listHtml);
        
        $wrap = $(".map-top-arrive-area");
        $list = $(".map-top-arrive-area .map-top-arrive-list");
        wrapWidth = $wrap.width();
        listWidth = $list.width();
        
        //롤링 초기화
        if (wrapWidth != '') {
            $list.css({'animation':`none`});
        }

        //롤링 설정
        if (listWidth > wrapWidth) {
            $list.css({'animation':`${listWidth / speed}s 1s linear infinite flowRolling`}); 

            timer = setInterval(function() {
                $list.css({'animation':`none`});
                
                arriveFlowAction();
            }, ((listWidth / speed) * 1000) + 1000);
        } else {
            $list.css({'animation':`1.5s 1s linear infinite notFlowRolling`});

            timer = setInterval(function() {
                $list.css({'animation':`none`});
                
                arriveFlowAction();
            }, 2500);
        }
    }
    
    //문자 체크
    function arriveFlowText(text) {
        let newText = "";
        
        [...text].forEach(char => ($.isNumeric(char) || char == " " || char == "-") ? newText += char : newText += "<span>" + char + "</span>");
        
        return newText;
    }
}

//실시간 버스 현황 보기
function setMapInit() {
    if ($("#map-main-route-layer.on").length > 0) {
        closeLayer($("#map-main-route-layer .mmrl-close-btn"));
    }
    
    if ($("#weak-pedestrian-layer.on").length > 0) {
        closeLayer($("#weak-pedestrian-layer .wpl-close-btn"));
    }
    
    $(".map-main-tab-list>li").removeClass("on");
    $(".map-main-tab-list>li[data-tab-type='mapView']").addClass("on");
}

//좌측에 잠시 후 도착 버스 슬라이드 설정
function setArriveSlide() {
    let arriveSwiper;
    
    //swiper 슬라이드 (잠시 후 도착 버스)
    if ($(".map-main-arrive-area .bus-arrive-list-area").length > 0) {
        arriveSwiper = new Swiper(".map-main-arrive-area .bus-arrive-list-area", {
            observer: true,
            observeParents: true,
            slidesPerView : 5,
            direction: "vertical",
            watchOverflow: true
        });
    }
}

//교통약자창에 잠시 후 도착 버스 슬라이드 설정
function setArriveSlide2() {
    let arriveSwiper2;
    
    //swiper 슬라이드 (잠시 후 도착 버스)
    if ($("#weak-pedestrian-layer .bus-arrive-list-area").length > 0) {
        arriveSwiper2 = new Swiper("#weak-pedestrian-layer .bus-arrive-list-area", {
            observer: true,
            observeParents: true,
            slidesPerView : 5,
            spaceBetween: 10,
            watchOverflow: true,
            navigation: {
                prevEl: '.arrive-list-prev-arrow',
                nextEl: '.arrive-list-next-arrow',
                clickable: true,
            },
        });
    }
}

//잠시 후 도착 버스 위치보기
function setBusPosition(obj) {
    let dataBusId = $(obj).closest("li").attr("data-bus-id");
    
    $(".bus-arrive-list-area .bus-arrive-list").each(function() {
        $(this).children("li").removeClass("on");
        $(this).children("li[data-bus-id='" + dataBusId + "']").addClass("on");
    });
}

//교통약자창의 노선검색
function setRouteSearch(obj) {
    let routeListHtml = `
        <div class="wpl-tit-area">
            <div class="wpl-tit-left-area">
                <button type="button" class="wpl-back-btn" onclick="moveLayer(this,'vWplMain');">
                    <span>잠시 후 도착 버스창으로 돌아가기</span>
                </button>
            </div>
            <div class="wpl-tit-center-area">
                <div class="wpl-tit-txt">원하시는 <span>노선번호</span>를 <span>클릭</span> 후, 실시간 버스 위치를 확인해 보세요!</div>
            </div>
        </div>
        <div class="wpl-con-area">
            <div class="route-list">
    `;
    
    //데이터 가져오기 (skyblue-item : 간선버스, red-item : 광역버스, red-item + red2-item : 공항버스, green-item : 지선버스, green-item + green2-item : 마을버스, blue-item : 급행버스, orange-item : 좌석버스)
    routeListHtml += `
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number skyblue-item">1</div>
                    <div class="direction">인천성모병원종점지 주차장 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number red-item">1000</div>
                    <div class="direction">서울역 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number skyblue-item">103</div>
                    <div class="direction">상정중학교 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number blue-item">12</div>
                    <div class="direction">금마초등학교 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number orange-item">202</div>
                    <div class="direction">석남동차고지 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number skyblue-item">300</div>
                    <div class="direction">송정역 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number skyblue-item">47</div>
                    <div class="direction">서창공영차고지 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number green-item">584</div>
                    <div class="direction">계양역 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number green-item">591</div>
                    <div class="direction">원창동(종점) 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number green-item">594</div>
                    <div class="direction">신영자동차 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number skyblue-item">71</div>
                    <div class="direction">강화터미널 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number red-item">M6628</div>
                    <div class="direction">연세대학교앞 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number skyblue-item">1</div>
                    <div class="direction">인천성모병원종점지 주차장 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number red-item">1000</div>
                    <div class="direction">서울역 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number skyblue-item">103</div>
                    <div class="direction">상정중학교 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number blue-item">12</div>
                    <div class="direction">금마초등학교 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number orange-item">202</div>
                    <div class="direction">석남동차고지 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number skyblue-item">300</div>
                    <div class="direction">송정역 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number skyblue-item">47</div>
                    <div class="direction">서창공영차고지 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number green-item">584</div>
                    <div class="direction">계양역 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number green-item">591</div>
                    <div class="direction">원창동(종점) 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number green-item">594</div>
                    <div class="direction">신영자동차 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number skyblue-item">71</div>
                    <div class="direction">강화터미널 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number red-item">M6628</div>
                    <div class="direction">연세대학교앞 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number skyblue-item">1</div>
                    <div class="direction">인천성모병원종점지 주차장 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number red-item">1000</div>
                    <div class="direction">서울역 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number skyblue-item">103</div>
                    <div class="direction">상정중학교 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number blue-item">12</div>
                    <div class="direction">금마초등학교 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number orange-item">202</div>
                    <div class="direction">석남동차고지 방면</div>
                </div>
                <div class="route-list-item" onclick="setRouteInfo2(this);">
                    <div class="number skyblue-item">300</div>
                    <div class="direction">송정역 방면</div>
                </div>
    `;
    
    routeListHtml += `
            </div>
        </div>
    `;
    
    $("#weak-pedestrian-layer .route-info-area").html("");
    $("#weak-pedestrian-layer .route-line-area").html("");
    $("#weak-pedestrian-layer .route-map-area").html("");
    $("#weak-pedestrian-layer .route-list-area").html(routeListHtml);
    
    $("#weak-pedestrian-layer .wpl-main-area").removeClass("on");
    $("#weak-pedestrian-layer .route-info-area").removeClass("on");
    $("#weak-pedestrian-layer .route-line-area").removeClass("on");
    $("#weak-pedestrian-layer .route-map-area").removeClass("on");
    $("#weak-pedestrian-layer .route-list-area").addClass("on");
    
    //교통약자창 노선검색 슬라이드 설정
    setRouteListSlide2();
}

//노선검색창 슬라이드 설정
function setRouteListSlide() {
    let routeListSlick;
    
    //slick 슬라이드 (노선검색 목록)
    if ($("#map-main-route-layer .route-list-area .route-list").length > 0) {
        routeListSlick = $("#map-main-route-layer .route-list-area .route-list").slick({
            infinite: false,
            slidesPerRow: 4,
            rows: 3,
            arrows: true,
            dots: false,
            fade: false,
            draggable: false,
            prevArrow: "<div class='route-list-prev-arrow'></div>",
            nextArrow: "<div class='route-list-next-arrow'></div>"
        });
        
        //초기 페이징 설정
        if ($("#map-main-route-layer .route-list-area .route-list .slick-slide").length > 0) {
            $("#map-main-route-layer .route-list-area .route-list-pagination").html("<span>1</span> / " + $("#map-main-route-layer .route-list-area .route-list .slick-slide").length);
        }
        
        //슬라이드시 페이징 설정
        routeListSlick.on("init reInit afterChange", function(e, slick, currentSlide) {
            let i = (currentSlide ? currentSlide : 0) + 1;
            
            $("#map-main-route-layer .route-list-area .route-list-pagination").html("<span>" + i + "</span> / " + slick.slideCount);
        });
    }
}

//교통약자창 노선검색 슬라이드 설정
function setRouteListSlide2() {
    let routeListSlick2;
    
    //slick 슬라이드 (노선검색 목록)
    if ($("#weak-pedestrian-layer .route-list-area .route-list").length > 0) {
        routeListSlick2 = $("#weak-pedestrian-layer .route-list-area .route-list").slick({
            infinite: false,
            slidesPerRow: 4,
            rows: 2,
            arrows: true,
            dots: false,
            fade: false,
            draggable: false,
            prevArrow: "<div class='route-list-prev-arrow'></div>",
            nextArrow: "<div class='route-list-next-arrow'></div>"
        });
    }
}

//노선검색창의 노선도보기
function setRouteInfo(obj) {
    //데이터 가져오기 (skyblue-item : 간선버스, red-item : 광역버스, red-item + red2-item : 공항버스, green-item : 지선버스, green-item + green2-item : 마을버스, blue-item : 급행버스, orange-item : 좌석버스)
    let routeInfoHtml = `
        <div class="route-info">
            <div class="route-info-item">
                <div class="route-info-tit">노선안내</div>
                <div class="route-info-con">
                    <div class="con-item">
                        <div class="type skyblue-item">1</div>
                        <div class="con">진웅종점 ↔ 인천성모병원종점지주차장</div>
                    </div>
                </div>
            </div>
            <div class="route-info-item">
                <div class="route-info-tit">운행시간</div>
                <div class="route-info-con">
                    <div class="con-item">
                        <div class="tit">기점</div>
                        <div class="con">평일 05:00~22:40 / 주말 05:00~22:40</div>
                    </div>
                    <div class="con-item">
                        <div class="tit">종점</div>
                        <div class="con">평일 05:00~23:20 / 주말 05:00~23:20</div>
                    </div>
                </div>
            </div>
            <div class="route-info-item">
                <div class="route-info-tit">배차간격</div>
                <div class="route-info-con">평일 14~19분 / 주말 22~28분</div>
            </div>
        </div>
    `;
    
    let routeLineHtml = routeInfoHtml + `
        <div class="route-line cf">
    `;
    
    //firststop : 기점 (before-line-list 클래스에 항목이 없을 경우 노출), prevstop : 이전 버튼 (before-line-list 클래스에 항목이 있을 경우 노출)
    routeLineHtml += `
            <ul class="route-line-list firststop">
                <li>
                    <div class="img">
                        <div class="direction-img" onclick="setRouteLineMove(this,'-');"></div>
                    </div>
                </li>
            </ul>
    `;
    
    //before-line-list : 목록에 노출되지 않는 이전 정류장
    routeLineHtml += `
            <ul class="route-line-list before-line-list"></ul>
    `;

    //데이터 가져오기 (right-line-list : 목록 첫번째 줄에 노출되는 정류장 (정류장 순서 1~12까지 설정))
    routeLineHtml += `
            <ul class="route-line-list right-line-list">
                <li data-station-order="1">
                    <div class="txt">진웅종점</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="2">
                    <div class="txt">한일금속</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="3">
                    <div class="txt">검단지식산업센타</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="4">
                    <div class="txt">JST기술연구소</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="5">
                    <div class="txt">삼영테크</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="6">
                    <div class="txt">금란마트</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="7">
                    <div class="txt">검단오류역</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="8">
                    <div class="txt">오류동역입구</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="9">
                    <div class="txt">검단오류역우방아이유쉘</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="10">
                    <div class="txt">단봉초등학교</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="11">
                    <div class="txt">길훈아파트</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="12">
                    <div class="txt">동성아파트</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
            </ul>
    `;
    
    //데이터 가져오기 (left-line-list : 목록 두번째 줄에 노출되는 정류장 (정류장 순서 13~24까지 설정), <li>의 mystop : 해당 정류장일 경우)
    routeLineHtml += `
            <ul class="route-line-list left-line-list">
                <li data-station-order="13">
                    <div class="txt">불로대곡동행정복지센터</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="14">
                    <div class="txt">월드아파트</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="15">
                    <div class="txt">E편한세상</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="16">
                    <div class="txt">불로중학교</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="17">
                    <div class="txt">동아전기</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="18">
                    <div class="txt">창신초등학교</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="19">
                    <div class="txt">E편한세상</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="20">
                    <div class="txt">원당사거리.검단선사박물관</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="21">
                    <div class="txt">가정LH3단지정문앞</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="22">
                    <div class="txt">루원시티프라디움</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="23">
                    <div class="txt">루원시티프라디움105동</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li class="mystop" data-station-order="24">
                    <div class="txt">가정(루원시티)역</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
            </ul>
    `;
    
    //데이터 가져오기 (right-line-list : 목록 세번째 줄에 노출되는 정류장 (정류장 순서 25~36까지 설정))
    routeLineHtml += `
            <ul class="route-line-list right-line-list">
                <li data-station-order="25">
                    <div class="txt">루원이편한세상하늘채(107동)</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="26">
                    <div class="txt">신현쇼핑</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="27">
                    <div class="txt">신현119안전센터</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="28">
                    <div class="txt">강남시장</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="29">
                    <div class="txt">성민병원</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="30">
                    <div class="txt">석남역(5번출구)</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="31">
                    <div class="txt">동아아파트후문</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="32">
                    <div class="txt">부원여중.동아아파트</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="33">
                    <div class="txt">부원중학교</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="34">
                    <div class="txt">부평역(대한극장)</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="35">
                    <div class="txt">부평역</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="36">
                    <div class="txt">굴다리오거리</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
            </ul>
    `;
    
    //데이터 가져오기 (after-line-list : 목록에 노출되지 않는 다음 정류장 (정류장 순서 37~끝까지 설정))
    routeLineHtml += `
            <ul class="route-line-list after-line-list">
                <li data-station-order="37">
                    <div class="txt">동수치안센터v</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="38">
                    <div class="txt">인천예림학교(인천성모병원)</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="39">
                    <div class="txt">부평역화성파크드림아파트</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
                <li data-station-order="40">
                    <div class="txt">인천성모병원종점지주차장</div>
                    <div class="img">
                        <div class="direction-img"></div>
                    </div>
                </li>
            </ul>
    `;
    
    //laststop : 종점 (after-line-list 클래스에 항목이 없을 경우 노출), nextstop : 다음 버튼 (after-line-list 클래스에 항목이 있을 경우 노출)
    routeLineHtml += `
            <ul class="route-line-list laststop">
                <li>
                    <div class="img">
                        <div class="direction-img" onclick="setRouteLineMove(this,'+');"></div>
                    </div>
                </li>
            </ul>
    `;
    
    routeLineHtml += `
        </div>
        <div class="route-bottom-btn">
            <button type="button" class="route-line-btn on" onclick="moveLayer(this,'vRouteLine');">
                <span>노선도 보기</span>
            </button>
            <button type="button" class="route-map-btn" onclick="moveLayer(this,'vRouteMap');">
                <span>지도보기</span>
            </button>
        </div>
        <button type="button" class="mmrl-back-btn" onclick="moveLayer(this,'vRouteList');">
            <span>노선검색창으로 돌아가기</span>
        </button>
    `;
    
    let routeMapHtml = routeInfoHtml + `
        <div class="route-map">
    `;
    
    //vRouteMapMap : 지도가 노출되는 영역
    routeMapHtml += `
            <div id="vRouteMapMap" class="route-map-map"></div>
    `;
    
    routeMapHtml += `
        </div>
        <div class="route-bottom-btn">
            <button type="button" class="route-line-btn" onclick="moveLayer(this,'vRouteLine');">
                <span>노선도 보기</span>
            </button>
            <button type="button" class="route-map-btn on" onclick="moveLayer(this,'vRouteMap');">
                <span>지도보기</span>
            </button>
        </div>
        <button type="button" class="mmrl-back-btn" onclick="moveLayer(this,'vRouteList');">
            <span>노선검색창으로 돌아가기</span>
        </button>
    `;
    
    $("#map-main-route-layer .route-line-area").html(routeLineHtml);
    $("#map-main-route-layer .route-map-area").html(routeMapHtml);
    
    $("#map-main-route-layer .route-list-area").removeClass("on");
    $("#map-main-route-layer .route-map-area").removeClass("on");
    $("#map-main-route-layer .route-line-area").addClass("on");
    
    //처음에 노출되는 노선도 설정
    setRouteLineMove($("#map-main-route-layer .route-line-area .route-line .firststop>li .img .direction-img"), '');
}

//교통약자창의 노선정보
function setRouteInfo2(obj) {
    let routeInfoHtml = `
        <div class="wpl-tit-area">
            <div class="wpl-tit-left-area">
                <button type="button" class="wpl-back-btn" onclick="moveLayer(this,'vRouteList2');">
                    <span>노선검색창으로 돌아가기</span>
                </button>
            </div>
            <div class="wpl-tit-center-area">
                <div class="wpl-tit-txt">노선정보</div>
            </div>
            <div class="wpl-tit-right-area">
                <button type="button" class="route-line-btn" onclick="moveLayer(this,'vRouteLine2');">
                    <span>노선도</span>
                </button>
                <button type="button" class="route-map-btn" onclick="moveLayer(this,'vRouteMap2');">
                    <span>지도보기</span>
                </button>
            </div>
        </div>
        <div class="wpl-con-area">
    `;
    
    //데이터 가져오기 (skyblue-item : 간선버스, red-item : 광역버스, red-item + red2-item : 공항버스, green-item : 지선버스, green-item + green2-item : 마을버스, blue-item : 급행버스, orange-item : 좌석버스)
    routeInfoHtml += `
            <div class="route-info">
                <div class="route-info-item">
                    <div class="route-info-tit">노선안내</div>
                    <div class="route-info-con">
                        <div class="con-item">
                            <div class="type skyblue-item">1</div>
                            <div class="con">진웅종점 ↔ 인천성모병원종점지주차장</div>
                        </div>
                    </div>
                </div>
                <div class="route-info-item">
                    <div class="route-info-tit">운행시간</div>
                    <div class="route-info-con">
                        <div class="con-item">
                            <div class="tit">기점</div>
                            <div class="con">평일 05:00~22:40 / 주말 05:00~22:40</div>
                        </div>
                        <div class="con-item">
                            <div class="tit">종점</div>
                            <div class="con">평일 05:00~23:20 / 주말 05:00~23:20</div>
                        </div>
                    </div>
                </div>
                <div class="route-info-item">
                    <div class="route-info-tit">배차간격</div>
                    <div class="route-info-con">평일 14~19분 / 주말 22~28분</div>
                </div>
            </div>
    `;
    
    routeInfoHtml += `
        </div>
    `;
    
    let routeLineHtml = `
        <div class="wpl-tit-area">
            <div class="wpl-tit-left-area">
                <button type="button" class="wpl-back-btn" onclick="moveLayer(this,'vRouteInfo');">
                    <span>노선안내 정보보기창으로 돌아가기</span>
                </button>
            </div>
            <div class="wpl-tit-center-area">
                <div class="wpl-tit-txt">노선정보</div>
            </div>
            <div class="wpl-tit-right-area">
                <button type="button" class="route-line-btn on" onclick="moveLayer(this,'vRouteLine2');">
                    <span>노선도</span>
                </button>
                <button type="button" class="route-map-btn" onclick="moveLayer(this,'vRouteMap2');">
                    <span>지도보기</span>
                </button>
            </div>
        </div>
        <div class="wpl-con-area">
            <div class="route-line cf">
    `;
    
    //firststop : 기점 (before-line-list 클래스에 항목이 없을 경우 노출), prevstop : 이전 버튼 (before-line-list 클래스에 항목이 있을 경우 노출)
    routeLineHtml += `
                <ul class="route-line-list firststop">
                    <li>
                        <div class="img">
                            <div class="direction-img" onclick="setRouteLineMove(this,'-');"></div>
                        </div>
                    </li>
                </ul>
    `;
    
    //before-line-list : 목록에 노출되지 않는 이전 정류장
    routeLineHtml += `
                <ul class="route-line-list before-line-list"></ul>
    `;

    //데이터 가져오기 (right-line-list : 목록 첫번째 줄에 노출되는 정류장 (정류장 순서 1~12까지 설정))
    routeLineHtml += `
                <ul class="route-line-list right-line-list">
                    <li data-station-order="1">
                        <div class="txt">진웅종점</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="2">
                        <div class="txt">한일금속</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="3">
                        <div class="txt">검단지식산업센타</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="4">
                        <div class="txt">JST기술연구소</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="5">
                        <div class="txt">삼영테크</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="6">
                        <div class="txt">금란마트</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="7">
                        <div class="txt">검단오류역</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="8">
                        <div class="txt">오류동역입구</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="9">
                        <div class="txt">검단오류역우방아이유쉘</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="10">
                        <div class="txt">단봉초등학교</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="11">
                        <div class="txt">길훈아파트</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="12">
                        <div class="txt">동성아파트</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                </ul>
    `;
    
    //데이터 가져오기 (left-line-list : 목록 두번째 줄에 노출되는 정류장 (정류장 순서 13~24까지 설정), <li>의 mystop : 해당 정류장일 경우)
    routeLineHtml += `
                <ul class="route-line-list left-line-list">
                    <li data-station-order="13">
                        <div class="txt">불로대곡동행정복지센터</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="14">
                        <div class="txt">월드아파트</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="15">
                        <div class="txt">E편한세상</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="16">
                        <div class="txt">불로중학교</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="17">
                        <div class="txt">동아전기</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="18">
                        <div class="txt">창신초등학교</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="19">
                        <div class="txt">E편한세상</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="20">
                        <div class="txt">원당사거리.검단선사박물관</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="21">
                        <div class="txt">가정LH3단지정문앞</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="22">
                        <div class="txt">루원시티프라디움</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="23">
                        <div class="txt">루원시티프라디움105동</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li class="mystop" data-station-order="24">
                        <div class="txt">가정(루원시티)역</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                </ul>
    `;
    
    //데이터 가져오기 (right-line-list : 목록 세번째 줄에 노출되는 정류장 (정류장 순서 25~36까지 설정))
    routeLineHtml += `
                <ul class="route-line-list right-line-list">
                    <li data-station-order="25">
                        <div class="txt">루원이편한세상하늘채(107동)</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="26">
                        <div class="txt">신현쇼핑</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="27">
                        <div class="txt">신현119안전센터</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="28">
                        <div class="txt">강남시장</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="29">
                        <div class="txt">성민병원</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="30">
                        <div class="txt">석남역(5번출구)</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="31">
                        <div class="txt">동아아파트후문</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="32">
                        <div class="txt">부원여중.동아아파트</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="33">
                        <div class="txt">부원중학교</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="34">
                        <div class="txt">부평역(대한극장)</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="35">
                        <div class="txt">부평역</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="36">
                        <div class="txt">굴다리오거리</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                </ul>
    `;

    //데이터 가져오기 (after-line-list : 목록에 노출되지 않는 다음 정류장 (정류장 순서 37~끝까지 설정))
    routeLineHtml += `
                <ul class="route-line-list after-line-list">
                    <li data-station-order="37">
                        <div class="txt">동수치안센터v</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="38">
                        <div class="txt">인천예림학교(인천성모병원)</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="39">
                        <div class="txt">부평역화성파크드림아파트</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                    <li data-station-order="40">
                        <div class="txt">인천성모병원종점지주차장</div>
                        <div class="img">
                            <div class="direction-img"></div>
                        </div>
                    </li>
                </ul>
    `;
    
    //laststop : 종점 (after-line-list 클래스에 항목이 없을 경우 노출), nextstop : 다음 버튼 (after-line-list 클래스에 항목이 있을 경우 노출)
    routeLineHtml += `
                <ul class="route-line-list laststop">
                    <li>
                        <div class="img">
                            <div class="direction-img" onclick="setRouteLineMove(this,'+');"></div>
                        </div>
                    </li>
                </ul>
    `;
    
    routeLineHtml += `
            </div>
        </div>
    `;
    
    let routeMapHtml = `
        <div class="wpl-tit-area">
            <div class="wpl-tit-left-area">
                <button type="button" class="wpl-back-btn" onclick="moveLayer(this,'vRouteInfo');">
                    <span>노선안내 정보보기창으로 돌아가기</span>
                </button>
            </div>
            <div class="wpl-tit-center-area">
                <div class="wpl-tit-txt">노선정보</div>
            </div>
            <div class="wpl-tit-right-area">
                <button type="button" class="route-line-btn" onclick="moveLayer(this,'vRouteLine2');">
                    <span>노선도</span>
                </button>
                <button type="button" class="route-map-btn on" onclick="moveLayer(this,'vRouteMap2');">
                    <span>지도보기</span>
                </button>
            </div>
        </div>
        <div class="wpl-con-area">
            <div class="route-map">
    `;
    
    //vRouteMapMap2 : 지도가 노출되는 영역
    routeMapHtml += `
                <div id="vRouteMapMap2" class="route-map-map"></div>
    `;
    
    routeMapHtml += `
            </div>
        </div>
    `;
    
    $("#weak-pedestrian-layer .route-info-area").html(routeInfoHtml);
    $("#weak-pedestrian-layer .route-line-area").html(routeLineHtml);
    $("#weak-pedestrian-layer .route-map-area").html(routeMapHtml);
    
    $("#weak-pedestrian-layer .route-list-area").removeClass("on");
    $("#weak-pedestrian-layer .route-line-area").removeClass("on");
    $("#weak-pedestrian-layer .route-map-area").removeClass("on");
    $("#weak-pedestrian-layer .route-info-area").addClass("on");
    
    //처음에 노출되는 노선도 설정
    setRouteLineMove($("#weak-pedestrian-layer .route-line-area .route-line .firststop>li .img .direction-img"), '');
}

//노선도에서 이전&다음 버튼 클릭시 노출되는 노선도 설정
function setRouteLineMove(obj, state) {
    let routeLineObj = $(obj).closest(".route-line");
    let routeBtnObj = $(obj).closest(".route-line-list");
    
    if ($(routeBtnObj).hasClass("prevstop") && state == "-") {
        //이전 버튼 클릭시
        $(routeLineObj).children(".route-line-list").each(function() {
            if ($(this).hasClass("before-line-list") || $(this).hasClass("right-line-list") || $(this).hasClass("left-line-list")) {
                let $lastItem = $(this).children("li:last-child");
                
                $(this).next("ul").prepend($lastItem);
            }
        });
    } else if ($(routeBtnObj).hasClass("nextstop") && state == "+") {
        //다음 버튼 클릭시
        $(routeLineObj).children(".route-line-list").each(function() {
            if ($(this).hasClass("right-line-list") || $(this).hasClass("left-line-list") || $(this).hasClass("after-line-list")) {
                let $firstItem = $(this).children("li:first-child");
                
                $(this).prev("ul").append($firstItem);
            }
        });
    }
    
    //기점 또는 이전 버튼 설정
    if ($(routeLineObj).children(".before-line-list").children("li").length > 0) {
        //이전 버튼 설정
        $(routeLineObj).children(".route-line-list:first-child").removeClass("firststop");
        $(routeLineObj).children(".route-line-list:first-child").addClass("prevstop");
    } else {
        //기점 설정
        $(routeLineObj).children(".route-line-list:first-child").removeClass("prevstop");
        $(routeLineObj).children(".route-line-list:first-child").addClass("firststop");
    }
    
    //종점 또는 다음 버튼 설정
    if ($(routeLineObj).children(".after-line-list").children("li").length > 0) {
        //다음 버튼 설정
        $(routeLineObj).children(".route-line-list:last-child").removeClass("laststop");
        $(routeLineObj).children(".route-line-list:last-child").addClass("nextstop");
    } else {
        //종점 설정
        $(routeLineObj).children(".route-line-list:last-child").removeClass("nextstop");
        $(routeLineObj).children(".route-line-list:last-child").addClass("laststop");
    }
}

//시정소식 슬라이드 설정
function setNewsSlide() {
    let swiperNav;
    let swiperFor;
    
    //swiper 슬라이드 (시정소식 제목과 내용)
    if ($(".news-main-area .swiper-nav").length > 0) {
        //20230728 수정부분 start
        swiperNav = new Swiper(".news-main-area .swiper-nav", {
            observer: true,
            observeParents: true,
            slidesPerView : 1,
            loop: true,
            effect: "flip",
            /*allowTouchMove: false,*/
            watchOverflow: true,
            pagination: {
                el: '.swiper-nav-pagination',
                clickable: true,
            },
        });
        //20230728 수정부분 end
    }
    
    //swiper 슬라이드 (시정소식 동영상)
    if ($(".news-video-area .swiper-for").length > 0) {
        let playerArr = [];
        let playerArr2 = [];
        let slideTimer;
        
        //20230728 수정부분 start
        swiperFor = new Swiper(".news-video-area .swiper-for", {
            observer: true,
            observeParents: true,
            slidesPerView: 1,
            loop: true,
            allowTouchMove: false,
            watchOverflow: true,
            navigation: {
                prevEl: '.swiper-for-prev-arrow',
                nextEl: '.swiper-for-next-arrow',
                clickable: true,
            },
            pagination: {
                el: '.swiper-for-pagination',
                clickable: true,
            },
            /*thumbs: {
                swiper: swiperNav
            },*/
            on: {
                init: function() {
                    //유튜브&동영상&이미지에 아이디 설정
                    $(".news-video-area .swiper-for>ul>li .news-video-item").each(function(idx) {
                        $(this).attr("id", "news-video-item" + idx);
                    });
                },
                slideChange: function() {
                    clearInterval(slideTimer);
                    
                    let slideObj = this;
                    
                    //유튜브일 경우
                    $(".news-video-area .swiper-for>ul>li .news-video-youtube").each(function() {
                        let dataYoutubeId = $(this).attr("data-youtube-id");
                        let playerId = $(this).attr("id");

                        //creating a player
                        let player = new YT.Player(playerId, {
                            width: '640',
                            height: '360',
                            videoId: dataYoutubeId,
                            playerVars: {
                                'rel': 0, //연관동영상 표시여부 (0 : 표시안함)
                                'controls': 1, //플레이어 컨트롤러 표시여부 (0 : 표시안함)
                                'autoplay': 1, //자동재생 여부 (1 : 자동재생함, mute와 함께 설정)
                                'mute': 1, //음소거여부 (1 : 음소거함)
                                'playsinline': 1, //iOS환경에서 전체화면으로 재생하지 않게 함
                                'modestbranding': 1
                            },
                            events: {
                                'onStateChange': onPlayerStateChange
                            }
                        });
                        
                        playerArr[playerId].mute();
                        playerArr[playerId].seekTo(0);
                        
                        if ($(this).parent("li").attr("data-swiper-slide-index") == slideObj.realIndex) {
                            playerArr[playerId].playVideo();
                        } else {
                            playerArr[playerId].pauseVideo();
                        }
                    });
                    
                    function onPlayerStateChange(e) {
                        if (e.data == 0) {
                            swiperFor.slideNext();
                        }
                    }
                    
                    //동영상일 경우
                    $(".news-video-area .swiper-for>ul>li .news-video-file").each(function() {
                        let playerId2 = $(this).attr("id");
                        
                        playerArr2[playerId2].muted = true;
                        playerArr2[playerId2].currentTime = 0;
                        
                        if ($(this).parent("li").attr("data-swiper-slide-index") == slideObj.realIndex) {
                            let playPromise = playerArr2[playerId2].play();
                            
                            if (playPromise !== null) {
                                playPromise.catch(() => {
                                    playerArr2[playerId2].play();
                                });
                            }
                        } else {
                            playerArr2[playerId2].pause();
                        }
                    });

                    if ($(".news-video-area .swiper-for>ul>li #news-video-item" + slideObj.realIndex).hasClass("news-video-file")) {
                        playerArr2["news-video-item" + slideObj.realIndex].addEventListener("ended",function() {
                            swiperFor.slideNext();
                        });
                    }
                    
                    //이미지일 경우 (30초)
                    if ($(".news-video-area .swiper-for>ul>li #news-video-item" + slideObj.realIndex).hasClass("news-video-img")) {
                        slideTimer = setInterval(function() {
                            swiperFor.slideNext();
                        }, 30000);
                    }
                }
            }
        });
        //20230728 수정부분 end
        
        //whenever youtube callback was called = deferred resolved
        //your custom function will be executed with YT as an argument
        YTdeferred.done(function(YT) {
            //유튜브일 경우
            $(".news-video-area .swiper-for>ul>li .news-video-youtube").each(function() {
                let dataYoutubeId = $(this).attr("data-youtube-id");
                let playerId = $(this).attr("id");
                
                //creating a player
                let player = new YT.Player(playerId, {
                    width: '640',
                    height: '360',
                    videoId: dataYoutubeId,
                    playerVars: {
                        'rel': 0, //연관동영상 표시여부 (0 : 표시안함)
                        'controls': 1, //플레이어 컨트롤러 표시여부 (0 : 표시안함)
                        'autoplay': 1, //자동재생 여부 (1 : 자동재생함, mute와 함께 설정)
                        'mute': 1, //음소거여부 (1 : 음소거함)
                        'playsinline': 1, //iOS환경에서 전체화면으로 재생하지 않게 함
                        'modestbranding': 1
                    },
                    events: {
                        'onReady': onPlayerReady,
                        'onStateChange': onPlayerStateChange
                    }
                });

                playerArr[playerId] = player;
            });
            
            function onPlayerReady(e) {
                e.target.mute();
                e.target.seekTo(0);
                
                if (e.target.g.id == "news-video-item0") {
                    e.target.playVideo();
                } else {
                    e.target.pauseVideo();
                }
            }

            function onPlayerStateChange(e) {
                if (e.data == 0) {
                    swiperFor.slideNext();
                }
            }
        });
        
        //동영상일 경우
        $(".news-video-area .swiper-for>ul>li .news-video-file").each(function() {
            let playerId2 = $(this).attr("id");
            
            playerArr2[playerId2] = $(this).get(0);
            playerArr2[playerId2].muted = true;
            playerArr2[playerId2].currentTime = 0;
            
            if (playerId2 == "news-video-item0") {
                let playPromise = playerArr2[playerId2].play();
                
                if (playPromise !== null) {
                    playPromise.catch(() => {
                        playerArr2[playerId2].play();
                    });
                }
            } else {
                playerArr2[playerId2].pause();
            }
        });
        
        if ($(".news-video-area .swiper-for>ul>li #news-video-item0").hasClass("news-video-file")) {
            playerArr2["news-video-item0"].addEventListener("ended",function() {
                swiperFor.slideNext();
            });
        }
        
        //이미지일 경우 (30초)
        if ($(".news-video-area .swiper-for>ul>li #news-video-item0").hasClass("news-video-img")) {
            slideTimer = setInterval(function() {
                swiperFor.slideNext();
            }, 30000);
        }
    }
}

//레이어창 열기
function openLayer(type, msg, fun) {
    $("#" + type + "-layer .l-box .l-con-area .l-con").html(msg);
    
    $("#" + type + "-layer .l-box .l-btn-area .confirm-btn").removeAttr("onclick");
    $("#" + type + "-layer .l-box .l-btn-area .confirm-btn").attr("onclick","closeLayer(this);" + fun);
    
    $("#" + type + "-layer").addClass("on");
    
    let scrollTop = parseInt($(document).scrollTop());

    $("body").css("top", -scrollTop + "px");

    $("body").addClass("scroll-disable").on('scroll touchmove', function(event) {
        event.preventDefault();
    });
}

//화면터치 안내창 열기
function openMapTouchLayer() {
    $("#map-main-touch-layer").addClass("on");
}

//노선검색창 열기
function openMapRouteLayer() {
    let routeListHtml = `
        <div class="route-list-top">
            <div class="route-list-top-img">
                <img src="img/img-touch2.png" alt="터치 이미지">
            </div>
            <div class="route-list-top-txt">원하시는 <span>노선번호</span>를 <span>클릭</span> 후,<br>실시간 버스 위치를 확인해 보세요!</div>
        </div>
        <div class="route-list">
    `;
    
    //데이터 가져오기 (skyblue-item : 간선버스, red-item : 광역버스, red-item + red2-item : 공항버스, green-item : 지선버스, green-item + green2-item : 마을버스, blue-item : 급행버스, orange-item : 좌석버스)
    routeListHtml += `
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number skyblue-item">1</div>
                <div class="direction">인천성모병원종점지 주차장 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number red-item">1000</div>
                <div class="direction">서울역 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number skyblue-item">103</div>
                <div class="direction">상정중학교 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number blue-item">12</div>
                <div class="direction">금마초등학교 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number orange-item">202</div>
                <div class="direction">석남동차고지 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number skyblue-item">300</div>
                <div class="direction">송정역 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number skyblue-item">47</div>
                <div class="direction">서창공영차고지 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number green-item">584</div>
                <div class="direction">계양역 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number green-item">591</div>
                <div class="direction">원창동(종점) 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number green-item">594</div>
                <div class="direction">신영자동차 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number skyblue-item">71</div>
                <div class="direction">강화터미널 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number red-item">M6628</div>
                <div class="direction">연세대학교앞 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number skyblue-item">1</div>
                <div class="direction">인천성모병원종점지 주차장 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number red-item">1000</div>
                <div class="direction">서울역 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number skyblue-item">103</div>
                <div class="direction">상정중학교 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number blue-item">12</div>
                <div class="direction">금마초등학교 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number orange-item">202</div>
                <div class="direction">석남동차고지 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number skyblue-item">300</div>
                <div class="direction">송정역 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number skyblue-item">47</div>
                <div class="direction">서창공영차고지 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number green-item">584</div>
                <div class="direction">계양역 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number green-item">591</div>
                <div class="direction">원창동(종점) 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number green-item">594</div>
                <div class="direction">신영자동차 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number skyblue-item">71</div>
                <div class="direction">강화터미널 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number red-item">M6628</div>
                <div class="direction">연세대학교앞 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number skyblue-item">1</div>
                <div class="direction">인천성모병원종점지 주차장 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number red-item">1000</div>
                <div class="direction">서울역 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number skyblue-item">103</div>
                <div class="direction">상정중학교 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number blue-item">12</div>
                <div class="direction">금마초등학교 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number orange-item">202</div>
                <div class="direction">석남동차고지 방면</div>
            </div>
            <div class="route-list-item" onclick="setRouteInfo(this);">
                <div class="number skyblue-item">300</div>
                <div class="direction">송정역 방면</div>
            </div>
    `;
    
    routeListHtml += `
        </div>
        <div class="route-list-pagination"></div>
        <button type="button" class="mmrl-close-btn" onclick="closeLayer(this);">
            <span>노선검색창 닫기</span>
        </button>
    `;
    
    $("#map-main-route-layer .route-line-area").html("");
    $("#map-main-route-layer .route-map-area").html("");
    $("#map-main-route-layer .route-list-area").html(routeListHtml);
    
    $("#map-main-route-layer .route-line-area").removeClass("on");
    $("#map-main-route-layer .route-map-area").removeClass("on");
    $("#map-main-route-layer .route-list-area").addClass("on");
    
    $(".map-main-tab-list>li").removeClass("on");
    $(".map-main-tab-list>li[data-tab-type='routeSearch']").addClass("on");
    
    $("#map-main-route-layer").addClass("on");
    
    //노선검색창 슬라이드 설정
    setRouteListSlide();
}

//교통약자창 열기
function openWeakPedestrianLayer() {
    if ($("#map-main-route-layer.on").length > 0) {
        closeLayer($("#map-main-route-layer .mmrl-close-btn"));
    }
    
    $("#weak-pedestrian-layer .route-list-area").html("");
    $("#weak-pedestrian-layer .route-info-area").html("");
    $("#weak-pedestrian-layer .route-line-area").html("");
    $("#weak-pedestrian-layer .route-map-area").html("");
    
    $("#weak-pedestrian-layer .route-list-area").removeClass("on");
    $("#weak-pedestrian-layer .route-info-area").removeClass("on");
    $("#weak-pedestrian-layer .route-line-area").removeClass("on");
    $("#weak-pedestrian-layer .route-map-area").removeClass("on");
    $(".map-main-area .map-main-arrive-area").removeClass("on");
    $("#weak-pedestrian-layer .wpl-main-area").addClass("on");
    
    $("#weak-pedestrian-layer").addClass("on");
}

//서비스 점검창 열기
function openInspectionLayer() {
    $("#inspection-layer").addClass("on");
    
    let scrollTop = parseInt($(document).scrollTop());

    $("body").css("top", -scrollTop + "px");

    $("body").addClass("scroll-disable").on('scroll touchmove', function(event) {
        event.preventDefault();
    });
}

//레이어창 내에서 이동하기
function moveLayer(obj, objId) {
    if (objId == "vRouteList") {
        //노선검색창으로 돌아가기 (노선검색창)
        $("#map-main-route-layer .route-line-area").html("");
        $("#map-main-route-layer .route-map-area").html("");
        
        $("#map-main-route-layer .route-line-area").removeClass("on");
        $("#map-main-route-layer .route-map-area").removeClass("on");
        $("#map-main-route-layer .route-list-area").addClass("on");
    } else if (objId == "vRouteLine") {
        //노선안내 노선도보기창으로 이동하기 (노선검색창)
        $("#map-main-route-layer .route-map-area").removeClass("on");
        $("#map-main-route-layer .route-line-area").addClass("on");
    } else if (objId == "vRouteMap") {
        //노선안내 지도보기창으로 이동하기 (노선검색창)
        $("#map-main-route-layer .route-line-area").removeClass("on");
        $("#map-main-route-layer .route-map-area").addClass("on");
        
        //노선안내 지도보기창에 지도 설정
        routeMapInit('vRouteMapMap');
    } else if (objId == "vWplMain") {
        //잠시 후 도착 버스창으로 돌아가기 (교통약자창)
        $("#weak-pedestrian-layer .route-list-area").html("");
        $("#weak-pedestrian-layer .route-info-area").html("");
        $("#weak-pedestrian-layer .route-line-area").html("");
        $("#weak-pedestrian-layer .route-map-area").html("");
        
        $("#weak-pedestrian-layer .route-list-area").removeClass("on");
        $("#weak-pedestrian-layer .route-info-area").removeClass("on");
        $("#weak-pedestrian-layer .route-line-area").removeClass("on");
        $("#weak-pedestrian-layer .route-map-area").removeClass("on");
        $("#weak-pedestrian-layer .wpl-main-area").addClass("on");
    } else if (objId == "vRouteList2") {
        //노선검색창으로 돌아가기 (교통약자창)
        $("#weak-pedestrian-layer .route-info-area").html("");
        $("#weak-pedestrian-layer .route-line-area").html("");
        $("#weak-pedestrian-layer .route-map-area").html("");
        
        $("#weak-pedestrian-layer .route-info-area").removeClass("on");
        $("#weak-pedestrian-layer .route-line-area").removeClass("on");
        $("#weak-pedestrian-layer .route-map-area").removeClass("on");
        $("#weak-pedestrian-layer .route-list-area").addClass("on");
    } else if (objId == "vRouteInfo") {
        //노선안내 정보보기창으로 돌아가기 (교통약자창)
        $("#weak-pedestrian-layer .route-line-area").removeClass("on");
        $("#weak-pedestrian-layer .route-map-area").removeClass("on");
        $("#weak-pedestrian-layer .route-info-area").addClass("on");
    } else if (objId == "vRouteLine2") {
        //노선안내 노선도보기창으로 이동하기 (교통약자창)
        $("#weak-pedestrian-layer .route-info-area").removeClass("on");
        $("#weak-pedestrian-layer .route-map-area").removeClass("on");
        $("#weak-pedestrian-layer .route-line-area").addClass("on");
    } else if (objId == "vRouteMap2") {
        //노선안내 지도보기창으로 이동하기 (교통약자창)
        $("#weak-pedestrian-layer .route-info-area").removeClass("on");
        $("#weak-pedestrian-layer .route-line-area").removeClass("on");
        $("#weak-pedestrian-layer .route-map-area").addClass("on");
        
        //노선안내 지도보기창에 지도 설정
        routeMapInit('vRouteMapMap2');
    }
}

//레이어창 닫기
function closeLayer(obj) {
    let objId = $(obj).closest(".l-area").attr("id");
    
    $(obj).closest(".l-area").removeClass("on");
    
    if (objId == "map-main-route-layer") {
        //노선검색창일 경우
        $("#map-main-route-layer .route-list-area").html("");
        $("#map-main-route-layer .route-line-area").html("");
        $("#map-main-route-layer .route-map-area").html("");
        
        $("#map-main-route-layer .route-list-area").removeClass("on");
        $("#map-main-route-layer .route-line-area").removeClass("on");
        $("#map-main-route-layer .route-map-area").removeClass("on");
        
        $(".map-main-tab-list>li").removeClass("on");
        $(".map-main-tab-list>li[data-tab-type='mapView']").addClass("on");
    } else if (objId == "weak-pedestrian-layer") {
        //교통약자창일 경우
        $("#weak-pedestrian-layer .route-list-area").html("");
        $("#weak-pedestrian-layer .route-info-area").html("");
        $("#weak-pedestrian-layer .route-line-area").html("");
        $("#weak-pedestrian-layer .route-map-area").html("");

        $("#weak-pedestrian-layer .route-list-area").removeClass("on");
        $("#weak-pedestrian-layer .route-info-area").removeClass("on");
        $("#weak-pedestrian-layer .route-line-area").removeClass("on");
        $("#weak-pedestrian-layer .route-map-area").removeClass("on");
        $("#weak-pedestrian-layer .wpl-main-area").removeClass("on");
        $(".map-main-area .map-main-arrive-area").addClass("on");
    }
    
    if ($(".l-wrap .l-area.on").length == 0 && $(obj).closest(".l-wrap").length > 0) {
        $("body").removeClass("scroll-disable").off('scroll touchmove');

        let scrollTop = Math.abs(parseInt($("body").css("top")));

        $("html,body").animate({scrollTop: scrollTop}, 0);
    }
}

//mapInit
function mapInit() {
    if ($("#vMapMainMap").length > 0) {
        var mapContainer = document.getElementById('vMapMainMap'), //지도를 표시할 div
        mapOption = {
            center: new kakao.maps.LatLng(37.382294,126.656398), //지도의 중심좌표
            level: 1 //지도의 확대 레벨
        };

        //지도를 표시할 div와 지도 옵션으로 지도를 생성합니다
        map = new kakao.maps.Map(mapContainer, mapOption); 

        //marker
        var content = document.createElement('div');
        //on : 마커를 클릭했을 경우
        content.className = 'busMakerArea on';
        //data-bus-id : 버스번호
        content.setAttribute('data-bus-id','인천00가1111');
        //data-bus-type : 버스종류 (skyblue : 간선버스, red : 광역버스&공항버스, green : 지선버스&마을버스, blue : 급행버스, orange : 좌석버스)
        content.setAttribute('data-bus-type','red');
        //data-lowbus-flag : 저상버스여부
        content.setAttribute('data-lowbus-flag','Y');
        var contentImg = document.createElement('div');
        contentImg.className = 'busMakerImg';
        var contentTxt = document.createElement('div');
        contentTxt.className = 'busMakerTxt';
        contentTxt.innerHTML = 'M6450';
        content.appendChild(contentImg);
        content.appendChild(contentTxt);
        contentImg.style.cssText = 'transform: rotate(40deg);';

        var positions = [
            new kakao.maps.LatLng(37.3821206,126.6567016),
            new kakao.maps.LatLng(37.3820496,126.6565872), 
            new kakao.maps.LatLng(37.3818029,126.6563552)
        ]

        var customOverlay = new kakao.maps.CustomOverlay({
            position: positions[0],
            content: content,
            map: map
        });

        //WARNNING 원래 이렇게 접근하는 건 위험합니다.
        var customOverlayElement = content.parentNode;
        //이 top, left 속성을 트랜지션 등록하는 것도 위험하긴 합니다. 차후에 바뀔가능성이 있습니다.
        customOverlayElement.style.transition = 'top 2s, left 2s';

        var index = 0;
        setInterval(function() {
            customOverlay.setPosition(positions[++index % 3]);
        }, 2000);
    }
}

//노선안내 지도보기창에 지도 설정
function routeMapInit(mapId) {
    if ($("#" + mapId).length > 0) {
        var routeMapContainer = document.getElementById(mapId), //지도를 표시할 div
        routeMapOption = {
            center: new kakao.maps.LatLng(37.382294,126.656398), //지도의 중심좌표
            level: 1 //지도의 확대 레벨
        };

        //지도를 표시할 div와 지도 옵션으로 지도를 생성합니다
        var routeMap = new kakao.maps.Map(routeMapContainer, routeMapOption);
    }
}

