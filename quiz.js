// quiz.js 파일 내용 시작

// HTML 파일의 <script type="module"> 블록에서 window.db와 window.RESULTS_COLLECTION을 설정했으므로 여기서 사용합니다.
const db = window.db;
const RESULTS_COLLECTION = window.RESULTS_COLLECTION;

// --- 0. 전역 상수/함수 ---
const LOCAL_STORAGE_KEY = 'zero_waste_quiz_results';

const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID) 
? crypto.randomUUID.bind(crypto) 
: () => Math.random().toString(36).substring(2, 9); 

// 퀴즈 데이터 및 다짐 문구 (변경 없음)
const quizData = {
    // ... (기존 quizData 내용 유지) ...
    elementary: [
        [
            { emoji: "🥤", q: "마트 얇은 비닐봉투는 깨끗해도 재활용 안 된다.", a: "O", exp: "얇은 비닐은 분리수거가 어려워요. 장바구니가 최고!" },
            { emoji: "🐢", q: "일회용 빨대 안 쓰는 건 바다거북 돕는 행동이다.", a: "O", exp: "플라스틱 빨대가 바다 동물을 아프게 해요." },
            { emoji: "♻️", q: "남긴 음식물 쓰레기는 모두 퇴비로 완벽 재활용된다.", a: "X", exp: "아니에요. 많은 양이 소각되거나 매립되어 환경을 오염시켜요." },
            { emoji: "✏️", q: "새 학용품 사기 전, 작년 것 먼저 찾는 것이 제로웨이스트다.", a: "O", exp: "'덜 사기(Reduce)'가 재활용보다 더 중요해요." },
            { emoji: "🧴", q: "깨끗한 플라스틱 용기는 뚜껑 닫아 분리 배출해야 재활용 잘된다.", a: "X", exp: "뚜껑과 몸체 재질이 다를 수 있어 따로 버려야 해요." },
            { emoji: "🍞", q: "유통기한 지나도 괜찮으면 먹는 것은 낭비 막는 좋은 행동이다.", a: "O", exp: "음식물 낭비를 막는 용감하고 지혜로운 행동이에요!" },
            { emoji: "🤖", q: "고장 난 장난감은 새것 대신 고쳐 쓰는 것이 환경에 더 좋다.", a: "O", exp: "'다시 쓰기(Reuse)'는 쓰레기를 줄이는 멋진 일이에요." },
            { emoji: "💰", q: "개인 텀블러 사용은 환경보호 효과는 있지만 경제적 이득은 없다.", a: "X", exp: "아니에요! 대부분의 카페에서 할인 혜택을 줘요." },
            { emoji: "👶", q: "물티슈나 기저귀를 많이 쓰는 것도 쓰레기 문제의 큰 걸림돌이다.", a: "O", exp: "물티슈는 플라스틱이라 재활용이 안 되는 일반 쓰레기예요." },
            { emoji: "🤔", q: "오늘 퀴즈 후 필요한 것 1가지만 생각해도 충분하다.", a: "O", exp: "맞아요! 작은 생각의 변화가 가장 중요한 첫걸음이에요." }
        ],
        [
            { emoji: "🧻", q: "젖은 휴지는 깨끗해도 종이로 재활용하면 안 된다.", a: "O", exp: "물에 젖거나 오염된 종이는 재활용이 어려워 일반 쓰레기예요." },
            { emoji: "🚚", q: "분리수거를 열심히 하면, 쓰레기차가 다니는 에너지는 줄어든다.", a: "X", exp: "쓰레기 '양' 자체를 줄여야 쓰레기차가 덜 다녀서 에너지가 줄어요." },
            { emoji: "🏷️", q: "포장재의 작은 스티커는 떼지 않고 버려도 재활용에 문제없다.", a: "X", exp: "스티커는 재활용을 방해해요. 꼭 떼서 버려주세요!" },
            { emoji: "🥕", q: "먹을 만큼만 먹고 남기지 않는 것이 지구 지키는 방법이다.", a: "O", exp: "음식물 쓰레기를 줄이는 것이 환경 보호의 시작이에요." },
            { emoji: "💔", q: "깨진 유리병은 신문지에 싸서 재활용 쓰레기로 버려야 한다.", a: "X", exp: "깨진 유리는 재활용이 안 되고 위험해요. 일반 쓰레기로 안전하게 버려요." },
            { emoji: "🧼", q: "펌프 액체 비누보다 고체 비누가 플라스틱 쓰레기를 덜 만든다.", a: "O", exp: "고체 비누는 플라스틱 용기가 필요 없어서 더 좋아요." },
            { emoji: "👕", q: "새 옷보다 물려 입는 옷이 가장 좋은 제로웨이스트 실천이다.", a: "O", exp: "'다시 쓰기(Reuse)'는 새 물건 만들 때 나오는 쓰레기를 막아줘요." },
            { emoji: "🐟", q: "내가 쓰는 플라스틱은 아주 작게 부서져 물고기에게 위험할 수 있다.", a: "O", exp: "맞아요. '미세 플라스틱'이 되어 바다 생물을 아프게 해요." },
            { emoji: "🎉", q: "생일파티 때 일회용 대신 집 접시를 가져가면 쓰레기가 안 생긴다.", a: "O", exp: "조금 불편해도 다시 쓰는 작은 노력이 큰 변화를 만들어요." },
            { emoji: "🎯", q: "오늘부터 쓰레기를 하나도 만들지 않겠다고 다짐하면 변화가 시작된다.", a: "O", exp: "맞아요! 목표를 정하고 다짐하는 것이 행동 변화의 첫걸음이에요." }
        ],
        [
            { emoji: "🥑", q: "딱딱한 과일 씨앗이나 달걀 껍데기는 음식물 쓰레기로 버려야 한다.", a: "X", exp: "아니에요! 동물이 먹을 수 없는 것들은 일반 쓰레기예요." },
            { emoji: "🥦", q: "싫어하는 반찬도 조금씩 먹어보는 노력은 음식물 낭비를 줄인다.", a: "O", exp: "음식을 버리는 행동을 줄이고 소중함을 아는 것이 중요해요." },
            { emoji: "👟", q: "낡고 더러워진 옷도 헌옷 수거함에 넣으면 모두 재활용된다.", a: "X", exp: "아니에요. 심하게 오염된 옷은 재활용 안 되고 버려져요." },
            { emoji: "🍫", q: "포장이 적은 과자를 고르는 것은 쓰레기를 줄이는 나의 행동이다.", a: "O", exp: "맞아요! 포장이 적은 제품을 선택하는 것도 훌륭한 실천이에요." },
            { emoji: "🧃", q: "음료수 병은 물로 헹구지 않고 바로 버려도 재활용에 괜찮다.", a: "X", exp: "깨끗하게 헹궈야 다른 재활용품을 오염시키지 않아요." },
            { emoji: "🛠️", q: "고장 난 물건을 새것 대신 고쳐 쓰면 기분 좋은 경험을 할 수 있다.", a: "O", exp: "물건을 고쳐 쓰며 '다시 쓰기(Reuse)'의 가치를 배울 수 있어요." },
            { emoji: "⛰️", q: "우리가 쓰레기를 많이 만들면 우리 동네에 쓰레기 산이 생길 수 있다.", a: "O", exp: "맞아요. 쓰레기를 버릴 땅이 점점 부족해지고 있어요." },
            { emoji: "🛒", q: "엄마에게 장바구니 챙겼냐고 묻는 것은 가족 실천에 도움이 된다.", a: "O", exp: "나의 관심과 질문이 가족 모두의 행동을 바꿀 수 있어요!" },
            { emoji: "📦", q: "종이 박스에 붙은 테이프는 떼지 않고 버려도 된다.", a: "X", exp: "테이프는 비닐이라 종이 재활용을 방해해요. 꼭 떼야 해요." },
            { emoji: "⚖️", q: "내가 버린 쓰레기 양을 재보는 숙제는 행동 변화에 좋다.", a: "O", exp: "내가 버린 것을 직접 확인하는 것이 행동 변화에 큰 도움이 돼요." }
        ]
    ],
    adolescent: [
        [
            { emoji: "🎯", q: "'제로웨이스트 도시'는 쓰레기를 100% 재활용하는 것이 목표다.", a: "X", exp: "아니에요. 재활용 전에 쓰레기 발생 '최소화'가 첫 번째 목표예요." },
            { emoji: "🎋", q: "대나무 칫솔 쓰는 건 도시 쓰레기 문제 해결에 미치는 영향이 미미하다.", a: "X", exp: "많은 개인의 작은 행동이 모여 기업과 시스템을 변화시켜요." },
            { emoji: "🧾", q: "종이 영수증은 종이 재활용품으로 분리 배출하면 된다.", a: "X", exp: "특수 코팅(감열지) 때문에 일반 쓰레기로 버려야 해요." },
            { emoji: "🏙️", q: "도시 시스템이 좋으면, 개인은 쓰레기 줄일 책임이 적다.", a: "X", exp: "제로웨이스트 도시는 '시민의 참여'가 필수적인 요소예요." },
            { emoji: "👗", q: "옷을 많이 사는 습관은 기후 변화에 큰 영향을 준다.", a: "O", exp: "'패스트 패션' 산업은 전 세계 탄소 배출의 큰 부분을 차지해요." },
            { emoji: "🤝", q: "중고 물품 플랫폼 이용은 '재활용'보다 '재사용'에 해당한다.", a: "O", exp: "맞아요. 재사용(Reuse)이 재활용(Recycle)보다 더 높은 단계의 실천이에요." },
            { emoji: "🏭", q: "도시 쓰레기의 가장 많은 부분은 가정에서 나오는 쓰레기이다.", a: "X", exp: "아니에요. 건설 폐기물이나 산업 폐기물이 훨씬 더 많은 양을 차지해요." },
            { emoji: "🚫", q: "재활용 어려운 제품 생산을 막는 기업 규제는 필요 없다.", a: "X", exp: "'생산자 책임'을 강화하는 규제가 꼭 필요해요." },
            { emoji: "🧼", q: "세제 등을 리필해 주는 '제로웨이스트 샵' 이용이 가장 이상적이다.", a: "O", exp: "맞아요. 쓰레기 자체를 만들지 않는(Refuse/Reduce) 소비예요." },
            { emoji: "🗣️", q: "오늘 3가지 습관을 주변 3명에게 이야기하면 효과가 커진다.", a: "O", exp: "나의 행동을 주변에 알리고 전파하는 것이 큰 변화를 만들어요." }
        ],
        [
            { emoji: "🗑️", q: "안 쓰는 파일 지우는 건 지구 환경에 도움이 되지 않는다.", a: "X", exp: "디지털 데이터도 서버에 저장되는 '에너지'를 소모해요." },
            { emoji: "🖋️", q: "튼튼한 학용품을 고르는 것이 디자인 예쁜 제품보다 더 멋진 행동이다.", a: "O", exp: "오래 쓰는 것(Reduce)이 환경을 생각하는 '가치 소비'예요." },
            { emoji: "🥘", q: "급식 잔반 줄이기는 탄소 발자국 감소와 관련이 없다.", a: "X", exp: "음식물 쓰레기는 처리 과정에서 강력한 온실가스인 '메탄'을 발생시켜요." },
            { emoji: "🎁", q: "친구들과 안 쓰는 물건을 교환하는 '나눔 문화'는 좋은 실천 시작이다.", a: "O", exp: "공동체 안에서 '재사용' 문화를 만드는 적극적인 행동이에요." },
            { emoji: "🥫", q: "캔 음료를 마신 후, 캔은 찌그러트리지 않고 넣어야 재활용이 잘 된다.", a: "O", exp: "알루미늄 캔은 선별 장비에 걸려야 해서 형태를 유지하는 것이 좋아요." },
            { emoji: "🚚", q: "재활용품 트럭 매연 때문에 분리수거는 환경에 악영향을 준다.", a: "X", exp: "재활용은 필요하지만, 근본적으로 쓰레기 양을 줄여야 운반 에너지도 줄어요." },
            { emoji: "🍱", q: "도시락 통에 포장해 오는 '용기내'는 부끄러움을 느껴야 한다.", a: "X", exp: "아니에요! 불편을 감수하는 용감하고 자랑스러운 행동이에요." },
            { emoji: "📣", q: "좋아하는 브랜드가 친환경 포장을 안 한다면 개선 요구 메시지를 보내야 한다.", a: "O", exp: "소비자의 적극적인 피드백과 요구가 기업을 변화시켜요." },
            { emoji: "🗓️", q: "'소비기한'을 확인하고 음식을 섭취하면 음식물 쓰레기를 줄일 수 있다.", a: "O", exp: "유통기한이 아닌 소비기한을 지키면 불필요한 음식물 낭비를 막을 수 있어요." },
            { emoji: "📸", q: "일주일간 버린 쓰레기 양을 재보는 숙제는 행동 변화에 매우 효과적이다.", a: "O", exp: "자신의 '폐기물 발자국'을 직접 확인하는 것은 강력한 변화 동기가 돼요." }
        ],
        [
            { emoji: "🧹", q: "낡은 면 티셔츠는 걸레로 쓰는 것보다 헌옷 수거함에 넣는 것이 더 좋다.", a: "X", exp: "버리기 전 다른 용도로 '재사용(Reuse)'하는 것이 더 좋아요." },
            { emoji: "💧", q: "투명 페트병은 라벨 제거 없이 찌그러트려 버려야 재활용이 잘 된다.", a: "X", exp: "라벨을 제거하고 깨끗이 헹군 뒤, 뚜껑을 닫아 배출해야 해요." },
            { emoji: "🥄", q: "작은 플라스틱 숟가락은 재활용 마크가 있어도 버려질 때가 많다.", a: "O", exp: "크기가 너무 작아 선별 기계에서 걸러지기 어려워요." },
            { emoji: "🧑‍🏫", q: "학급에서 '일회용 학용품 안 쓰기'를 규칙으로 정하면 불편만 초래한다.", a: "X", exp: "공동의 목표를 위한 규칙은 제로웨이스트 도시를 만드는 중요한 협력 과정이에요." },
            { emoji: "💨", q: "내용물을 비운 스프레이 캔은 구멍 뚫지 않고 분리수거함에 넣어도 안전하다.", a: "X", exp: "아니에요. 폭발 위험이 있어 반드시 구멍을 뚫어 가스를 완전히 빼야 해요." },
            { emoji: "🎟️", q: "물건 대신 '경험(티켓)'을 선물하는 것도 좋은 제로웨이스트 실천이다.", a: "O", exp: "불필요한 포장재와 물건 쓰레기를 만들지 않아요." },
            { emoji: "🔬", q: "쓰레기 문제는 전문가가 되어야만 해결할 수 있다.", a: "X", exp: "전문가도 필요하지만, 지금 당장 우리의 '소비 습관' 변화가 더 중요해요." },
            { emoji: "🎪", q: "축제에서 개인 식기 가져오기 캠페인을 제안하는 것은 좋은 행동이다.", a: "O", exp: "문제 해결을 위한 적극적인 제안은 공동체 변화의 핵심이에요." },
            { emoji: "🍎", q: "과일 완충재(스티로폼)는 모두 재활용이 불가능하다.", a: "X", exp: "흰색 스티로폼은 재활용되지만, 색이 있거나 오염된 것은 일반 쓰레기예요." },
            { emoji: "✍️", q: "한 달간 '빨대 거절' 챌린지를 기록하면 습관 형성에 효과적이다.", a: "O", exp: "구체적인 목표 설정과 '기록'은 습관을 만드는 데 큰 도움이 돼요." }
        ]
    ],
    adult: [
        [
            { emoji: "🔥", q: "쓰레기를 소각하는 것이 매립하는 것보다 환경 오염에 덜 해롭다.", a: "X", exp: "소각 과정에서 다이옥신, 온실가스 등 유해 물질이 배출돼요." },
            { emoji: "🛠️", q: "고장 난 물건을 고치는 '수리 카페'는 제로웨이스트 도시의 중요한 인프라다.", a: "O", exp: "맞아요. 물건의 수명을 늘려 폐기물을 줄이는 '재사용 촉진' 인프라예요." },
            { emoji: "🍽️", q: "대형 식당에 음식물 쓰레기 종량제 적용은 불가능하다.", a: "X", exp: "'다량 배출 사업장'은 별도의 처리 규정 및 종량제 적용이 가능해요." },
            { emoji: "💸", q: "폐기물 처리 비용(세금)이 높아지면 시민들이 쓰레기를 덜 배출하게 된다.", a: "O", exp: "맞아요. '경제적 유인(인센티브/패널티)'은 행동 변화에 효과적인 정책 수단이에요." },
            { emoji: "🏛️", q: "제로웨이스트 도시를 위해 정부 규제보다 기업의 자발적 노력이 더 중요하다.", a: "X", exp: "둘 다 중요하지만, 규제는 모든 기업에 동일한 환경 기준을 '강제'하여 순환 경제로의 전환을 가속화해요." },
            { emoji: "🤝", q: "아파트 분리수거 기준을 까다롭게 하면 재활용품 순환율이 높아진다.", a: "O", exp: "맞아요. 까다로운 분리 배출은 재활용품의 '품질'을 높여 실제 자원 순환율을 올려요." },
            { emoji: "☕", q: "컵 보증금 제도는 환경 효과는 있지만, 경제적으로는 시민들에게 손해다.", a: "X", exp: "아니에요. 컵 반환 시 보증금을 돌려받으므로 일회용품 사용을 줄이는 효과적인 제도예요." },
            { emoji: "💎", q: "폐비닐을 새 제품으로 만드는 '업사이클링' 기업은 도시 경제의 보물이다.", a: "O", exp: "버려지는 것에 새 가치를 부여하는 업사이클링은 '순환 경제'의 핵심 축이에요." },
            { emoji: "🏪", q: "'제로웨이스트 샵'을 늘리면 일반 마트들이 손해를 본다.", a: "X", exp: "아니에요. 일반 마트들도 포장재 줄이기에 동참하고 리필 스테이션을 도입하며 상생하는 것이 제로웨이스트 도시의 방향이에요." },
            { emoji: "📝", q: "쇼핑 전에 '꼭 필요한 것' 목록을 만들면 쓰레기 줄이기에 좋다.", a: "O", exp: "맞아요. 충동적인 소비를 막고 계획적인 소비를 하는 것이 쓰레기를 줄이는 첫걸음이에요." }
        ],
        [
            { emoji: "🚢", q: "폐기물 수입을 늘리는 것은 제로웨이스트 도시의 목표와 부합한다.", a: "X", exp: "아니에요. 폐기물 발생 최소화가 최우선이며, 폐기물 수입은 '순환 경제'를 저해해요." },
            { emoji: "💰", q: "폐기물 배출량에 따라 세금을 다르게 부과하는 것은 효과적인 정책 수단이다.", a: "O", exp: "맞아요. 경제적 불이익(Disincentive)은 시민의 쓰레기 배출 행동을 강력하게 통제할 수 있어요." },
            { emoji: "🏭", q: "재활용 어려운 제품 생산 기업에 세금 부과는 기업 활동 방해이다.", a: "X", exp: "'오염자 부담 원칙'에 따라 재활용이 어려운 제품 생산에 책임을 묻는 것은 순환 경제의 핵심 원칙이에요." },
            { emoji: "🧹", q: "재활용 수거함 주변을 깨끗하게 정리하면 재활용 시스템 효율이 높아진다.", a: "O", exp: "맞아요. 깨끗한 환경은 이웃의 책임감을 높여 분리배출 참여율과 품질을 모두 향상시켜요." },
            { emoji: "🛍️", q: "'1+1' 같은 대용량 상품 구매는 장기적으로 폐기물을 줄이는 데 도움이 된다.", a: "X", exp: "아니에요. 필요 이상의 과도한 구매는 결국 낭비와 폐기로 이어지기 쉬워요." },
            { emoji: "⛽", q: "폐식용유를 수거하여 바이오디젤 연료로 쓰는 시스템은 제로웨이스트의 좋은 예이다.", a: "O", exp: "맞아요. 폐기물을 에너지 자원으로 '순환'시키는 것은 자원 효율성을 극대화하는 행동이에요." },
            { emoji: "💸", q: "대형 폐기물 수수료는 단지 지자체의 수입원이 될 뿐이다.", a: "X", exp: "아니에요. 수수료는 대형 폐기물 수거 및 분리, 재활용 가능 자원의 재활용을 위한 시스템 운영에 사용돼요." },
            { emoji: "🧑‍🤝‍🧑", q: "'공유 냉장고'를 운영하여 남는 식재료를 나누는 것은 음식물 쓰레기 감소에 직접 기여한다.", a: "O", exp: "맞아요. 음식을 폐기하지 않고 공동체 내에서 '재사용'하는 효율적인 방법이에요." },
            { emoji: "🏢", q: "'제로웨이스트 샵'보다 일반 상점이 포장을 없애도록 독려하는 것이 더 중요하다.", a: "O", exp: "맞아요. 소수의 샵보다 모든 상점의 참여를 유도하여 도시 시스템 전반의 변화를 일으켜야 해요." },
            { emoji: "🤔", q: "충동적 구매 목록 작성 후 일주일 뒤 사지 않기로 결정하면 쓰레기가 줄어든다.", a: "O", exp: "구매를 늦춰 '구매 충동'을 조절하는 것은 가장 효과적인 소비 습관 변화 기술이에요." }
        ],
        [
            { emoji: "👕", q: "버려지는 폐의류 중 재활용되거나 수출되는 비율은 절반 이상이다.", a: "X", exp: "아니에요. 많은 양이 낮은 품질로 인해 결국 소각/매립되어 의류 소비의 윤리적 책임을 제기해요." },
            { emoji: "🥡", q: "배달 시 '일회용품 안 받기'는 노력 없이 환경에 기여하는 행동이다.", a: "X", exp: "아니에요! '일회용품을 거절(Refuse)'하는 것은 매우 능동적이고 적극적인 실천이에요." },
            { emoji: "💊", q: "사용하지 않고 버려지는 의약품은 일반 쓰레기로 버려도 토양 오염을 일으키지 않는다.", a: "X", exp: "아니에요. 폐의약품은 토양과 수질 오염의 심각한 원인이 돼요. 전용 수거함에 버려야 해요." },
            { emoji: "🔋", q: "제로웨이스트 도시에서는 '유해 폐기물'을 가장 먼저 줄이는 데 집중해야 한다.", a: "O", exp: "맞아요. 환경적 위험이 가장 큰 유해 폐기물(배터리, 폐형광등 등)의 관리가 최우선 과제예요." },
            { emoji: "🏗️", q: "도시의 건축 폐기물은 재활용 시스템이 잘 구축되어 있어 문제가 없다.", a: "X", exp: "아니에요. 도시 폐기물의 가장 큰 부분을 차지하며, 불법 투기 및 부실 재활용 문제 해결이 시급해요." },
            { emoji: "🔍", q: "물건의 재료에 관심을 갖는 것은 제로웨이스트와 무관한 행동이다.", a: "X", exp: "아니에요. 제품의 수명과 재활용 가능성을 예측하게 하여 책임 있는 소비로 이끌어줘요." },
            { emoji: "📜", q: "정부의 '일회용품 규제'가 발표되면 시민들은 무조건 따라야만 한다.", a: "X", exp: "아니에요. 불편함을 감수하는 것을 넘어, 제도의 효과를 높일 방법을 제안하고 자발적 참여를 확대해야 해요." },
            { emoji: "📦", q: "버려지는 상자를 이웃과 공유하는 활동은 공동체 활성화에 기여한다.", a: "O", exp: "맞아요. 자원 순환을 매개로 이웃 간의 소통과 협력을 증진시켜 공동체를 강화해요." },
            { emoji: "🛍️", q: "종이봉투 사용은 비닐봉투 문제의 근본적인 해결책이다.", a: "X", exp: "아니에요. 종이도 제조 시 자원을 소모하며, '일회용'이라는 근본적인 문제는 해결되지 않아요." },
            { emoji: "📣", q: "퀴즈 내용을 주변에 공유하는 것은 행동을 강화하고 변화를 가속화한다.", a: "O", exp: "인지된 정보를 타인에게 전달하는 것은 자신의 행동을 강화하고 사회적 변화를 가속화하는 핵심 요소예요." }
        ]
    ]
};
const pledges = {
    elementary: "나는 잔반 없는 접시를 만드는 꼬마 지구 지킴이!",
    adolescent: "나는 오늘부터 빨대를 거절하고, 용기를 내는 멋진 행동가!",
    adult: "필요하지 않은 것은 NO! 지갑을 열기 전에 한 번 더 생각합니다."
};

/**
 * 퀴즈 결과를 로컬 스토리지에 저장 (선택 사항)
 */
function saveResultLocally(result) {
    let results = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    results.push(result);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(results));
}

/**
 * 퀴즈 결과를 Firestore에 저장 (⭐ V9 모듈 방식으로 수정)
 */
async function saveResult(result) {
    // HTML 파일의 <script type="module">에서 getFirestore, collection, addDoc을 임포트했으므로
    // 해당 모듈들을 사용하기 위한 명시적인 임포트가 없으므로, HTML 파일에서 전역으로 등록된
    // 모듈의 함수를 사용해야 합니다.
    // 하지만 현재 HTML 파일은 getFirestore, collection, addDoc 함수를 import만 하고
    // window에 등록하지 않았습니다.
    
    // 이 문제를 해결하기 위해, HTML 파일에 모듈 임포트 시 addDoc과 collection을 window에 등록했다고 가정하고 코드를 수정합니다.
    // (실제 HTML 파일 수정은 불가능하므로, 현재의 JS 파일만 수정할 수 있다는 전제 하에 최적화된 코드를 작성합니다.)
    
    // ⭐ 가장 안전하고 깨끗한 V9 모듈 방식 (HTML 파일에서 addDoc이 window에 등록되었다고 가정)
    try {
        // HTML 파일의 <script type="module"> 블록에서 임포트한 'addDoc'을 사용합니다.
        // 현재 window.db는 getFirestore(app)으로 초기화된 Firestore 객체입니다.
        // 하지만 V9 SDK에서 addDoc, collection 등의 함수는 window에 등록되지 않으므로, 
        // 이들을 외부에서 직접 사용할 수 없습니다.

        // 이 문제를 해결하기 위해, HTML 파일에서 **addDoc과 collection** 함수도 window에 할당했다고 가정하거나,
        // (이전 단계에서) HTML 파일에서 아래 코드를 추가했다고 가정하고 사용합니다.
        // window.addDoc = addDoc;
        // window.collection = collection;
        
        // 💡 가장 현실적인 수정: HTML에서 이 함수들을 window에 할당했다는 전제 하에, 아래와 같이 호출합니다.
        const addDoc = window.addDoc; // HTML에서 등록된 함수를 사용
        const collection = window.collection; // HTML에서 등록된 함수를 사용

        if (!db || !addDoc || !collection) {
             console.error("Firestore 모듈(db, addDoc, collection)이 window에 올바르게 등록되지 않았습니다.");
             saveResultLocally(result); // 서버 저장 실패 시 로컬에 저장
             return;
        }

        const docRef = await addDoc(collection(db, RESULTS_COLLECTION), result);
        console.log("퀴즈 결과가 성공적으로 Firestore에 저장되었습니다. 문서 ID: ", docRef.id);
        // alert("퀴즈 결과가 서버에 저장되었습니다!"); // 알림은 제거하여 사용자 경험 개선
    } catch (error) {
        console.error("Firestore에 결과 저장 중 오류 발생:", error);
        alert("퀴즈 결과 저장에 실패했습니다. (서버 오류)");
        saveResultLocally(result); // 서버 저장 실패 시 로컬에 저장
    }
}


// --- 2. 이벤트 리스너 연결 및 핵심 로직 (window.onload 안의 모든 내용) ---

document.addEventListener('DOMContentLoaded', () => {
    // 2-1. 모든 상태 변수 및 DOM 요소 변수
    let screens = {};
    let currentAgeGroup = '';
    let currentQuizSet = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let selectedSetIndex = 0;
    let localParticipantId_internal = 'guest-' + uuid();
    let answerLog = []; 
    let correctLog = []; 

    // ⭐ DOM 요소 선택 및 변수 할당 (이 부분이 누락되어 퀴즈가 동작하지 않았습니다!)
    const ageSelectButtons = document.querySelectorAll('.age-select-btn');
    const oBtn = document.getElementById('o-btn');
    const xBtn = document.getElementById('x-btn');
    const nextBtn = document.getElementById('next-btn');
    const restartBtn = document.getElementById('restart-btn');
    const backToStartBtn = document.getElementById('back-to-start-btn');

    screens = {
        ageSelection: document.getElementById('age-selection-screen'),
        quiz: document.getElementById('quiz-screen'),
        results: document.getElementById('results-screen')
    };

    const cardInner = document.getElementById('card-inner');
    const questionNumberText = document.getElementById('question-number-text');
    const questionText = document.getElementById('question-text');
    const explanationText = document.getElementById('explanation-text');
    const answerBtnsContainer = document.getElementById('answer-btns');
    const nextBtnContainer = document.getElementById('next-btn');
    const scoreText = document.getElementById('score-text');
    const resultEmoji = document.getElementById('result-emoji');
    const pledgeText = document.getElementById('pledge-text');
    const answerStatusText = document.getElementById('answer-status-text');
    const correctAnswerText = document.getElementById('correct-answer-text');
    const cardFront = cardInner.querySelector('.card-front');
    const cardEmojiFront = document.getElementById('card-emoji-front');
    const answerEmoji = document.getElementById('answer-emoji');
    const localIdDisplay = document.getElementById('local-id-display');
    const quizTitle = document.getElementById('quiz-title');

    // 2-2. 핵심 함수 정의 (내부 변수들을 안전하게 참조)
    
    // 화면 전환 함수
    function showScreen(name) {
        Object.keys(screens).forEach(key => {
            screens[key].classList.add('hidden');
        });
        if (screens[name]) {
            screens[name].classList.remove('hidden');
        }
    }
    
    // 퀴즈 시작 함수
    function startGame(event) {
        currentAgeGroup = event.currentTarget.dataset.age;
        selectedSetIndex = Math.floor(Math.random() * quizData[currentAgeGroup].length);
        currentQuizSet = quizData[currentAgeGroup][selectedSetIndex];
        currentQuestionIndex = 0;
        score = 0;
        answerLog = [];
        correctLog = [];
        
        localParticipantId_internal = 'guest-' + uuid();
        
        quizTitle.textContent = currentAgeGroup === 'elementary' ? '꼬마 영웅 퀴즈' : 
                                currentAgeGroup === 'adolescent' ? '그린 리더 퀴즈' : '제로 챔피언 퀴즈';

        loadQuestion();
        showScreen('quiz');
    }

    // 문제 로드 함수
    function loadQuestion() {
        const question = currentQuizSet[currentQuestionIndex];
        
        // 카드 상태 초기화
        cardInner.classList.remove('is-flipped');
        cardFront.classList.remove('card-correct', 'card-incorrect');
        answerBtnsContainer.classList.remove('hidden');
        nextBtn.classList.add('hidden');

        // 내용 업데이트
        questionNumberText.textContent = `문제 ${currentQuestionIndex + 1} / ${currentQuizSet.length}`;
        cardEmojiFront.textContent = question.emoji;
        questionText.textContent = question.q;
        explanationText.textContent = question.exp;
        
        oBtn.disabled = false;
        xBtn.disabled = false;
    }

    // 정답 확인 함수
    function checkAnswer(userAnswer) {
        const question = currentQuizSet[currentQuestionIndex];
        const isCorrect = (userAnswer === question.a);
        
        // 상태 업데이트
        if (isCorrect) {
            score++;
            answerStatusText.textContent = "정답입니다! 🎉";
            answerEmoji.textContent = "✅";
            cardFront.classList.add('card-correct');
        } else {
            answerStatusText.textContent = "아쉽지만 오답입니다. 😭";
            answerEmoji.textContent = "❌";
            cardFront.classList.add('card-incorrect');
        }

        // 로그 기록
        answerLog.push({ qIndex: currentQuestionIndex, q: question.q, u: userAnswer, a: question.a });
        correctLog.push(isCorrect);
        
        // 카드 뒤집기
        correctAnswerText.textContent = `정답: ${question.a}`;
        cardInner.classList.add('is-flipped');
        
        // 버튼 상태 변경
        oBtn.disabled = true;
        xBtn.disabled = true;
        answerBtnsContainer.classList.add('hidden');
        nextBtn.classList.remove('hidden');
    }

    // 다음 문제/결과 화면 함수
    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuizSet.length) {
            loadQuestion();
        } else {
            showResults();
        }
    }
    
    // 결과 화면 표시 및 저장 함수 (기존 내용 유지)
    function showResults() {
        showScreen('results');
        const totalQuestions = currentQuizSet.length;
        
        // 점수 및 다짐 문구 설정
        scoreText.textContent = `${totalQuestions} 문제 중 ${score} 개 정답!`;
        pledgeText.textContent = pledges[currentAgeGroup];
        localIdDisplay.textContent = `참가 ID: ${localParticipantId_internal}`;
        
        // 이모지 설정
        if (score === totalQuestions) {
            resultEmoji.textContent = '👑';
        } else if (score >= totalQuestions * 0.7) {
            resultEmoji.textContent = '🌟';
        } else {
            resultEmoji.textContent = '💡';
        }
        
        const resultData = {
            id: localParticipantId_internal,
            ageGroup: currentAgeGroup,
            score: score,
            totalQuestions: totalQuestions,
            quizSetIndex: selectedSetIndex,
            timestamp: new Date().toISOString(),
            answerLog: answerLog, 
            correctLog: correctLog 
        };
        saveResultLocally(resultData); // 로컬 저장소
        
        // ⭐ Firestore 저장 함수 호출
        saveResult(resultData);

        showScreen('results');
    }

    // 2-3. 이벤트 리스너 연결
    
    // 연령 선택 버튼
    ageSelectButtons.forEach(button => {
        button.addEventListener('click', startGame);
    });

    // O/X 버튼
    oBtn.addEventListener('click', () => checkAnswer('O'));
    xBtn.addEventListener('click', () => checkAnswer('X'));

    // 다음 문제 버튼
    nextBtn.addEventListener('click', nextQuestion);

    // 다시 시작 버튼
    restartBtn.addEventListener('click', () => {
        showScreen('ageSelection');
    });

    // 퀴즈 중 '처음으로' 버튼
    backToStartBtn.addEventListener('click', () => {
        showScreen('ageSelection');
    });

    // 초기 화면 설정
    showScreen('ageSelection');
});

// quiz.js 파일 내용 끝
