const HSK_GRAMMAR_DATA = [
    {
        level: 1,
        color: "#4CAF50",
        points: [
            {
                title: "Câu chữ 是 (Shì)",
                structure: "A + 是 + B",
                explanation: "Dùng để xác định danh tính, nghề nghiệp, quốc tịch. Phủ định dùng '不是'.",
                examples: [
                    { hanzi: "我是学生。", pinyin: "Wǒ shì xuéshēng.", vi: "Tôi là học sinh." },
                    { hanzi: "他不是老师。", pinyin: "Tā bú shì lǎoshī.", vi: "Ông ấy không phải giáo viên." }
                ]
            },
            {
                title: "Trợ từ sở hữu 的 (De)",
                structure: "Chủ sở hữu + 的 + Vật sở hữu",
                explanation: "Biểu thị quan hệ sở hữu. Nếu quan hệ thân thiết (gia đình) có thể lược bỏ '的'.",
                examples: [
                    { hanzi: "我的书", pinyin: "Wǒ de shū", vi: "Sách của tôi" },
                    { hanzi: "我妈妈", pinyin: "Wǒ māma", vi: "Mẹ tôi" }
                ]
            },
            {
                title: "Câu hỏi với 吗 (Ma)",
                structure: "Câu trần thuật + 吗？",
                explanation: "Thêm '吗' vào cuối câu để biến thành câu hỏi Đúng/Sai (Yes/No).",
                examples: [
                    { hanzi: "你是中国人吗？", pinyin: "Nǐ shì Zhōngguórén ma?", vi: "Bạn là người Trung Quốc phải không?" }
                ]
            },
            {
                title: "Đại từ nghi vấn",
                structure: "Dùng trong vị trí của từ muốn hỏi",
                explanation: "Trật tự câu hỏi trong tiếng Trung giữ nguyên như câu trần thuật.",
                examples: [
                    { hanzi: "你叫什么名字？", pinyin: "Nǐ jiào shénme míngzi?", vi: "Bạn tên là gì? (hỏi cái gì)" },
                    { hanzi: "他是谁？", pinyin: "Tā shì shuí?", vi: "Anh ấy là ai?" }
                ]
            }
        ]
    },
    {
        level: 2,
        color: "#2196F3",
        points: [
            {
                title: "Câu so sánh với 比 (Bǐ)",
                structure: "A + 比 + B + Từ chỉ tính chất",
                explanation: "Dùng để so sánh A hơn B về một đặc điểm nào đó.",
                examples: [
                    { hanzi: "哥哥比我高。", pinyin: "Gēge bǐ wǒ gāo.", vi: "Anh trai cao hơn tôi." },
                    { hanzi: "今天比昨天冷。", pinyin: "Jīntiān bǐ zuótiān lěng.", vi: "Hôm nay lạnh hơn hôm qua." }
                ]
            },
            {
                title: "Trợ từ ngữ khí 了 (Le)",
                structure: "Cuối câu",
                explanation: "Biểu thị sự thay đổi trạng thái hoặc một tình huống mới phát sinh.",
                examples: [
                    { hanzi: "下雨了。", pinyin: "Xià yǔ le.", vi: "Trời mưa rồi (trước đó chưa mưa)." },
                    { hanzi: "我不买了。", pinyin: "Wǒ bù mǎi le.", vi: "Tôi không mua nữa (quyết định mới)." }
                ]
            },
            {
                title: "Bổ ngữ trình độ 得 (De)",
                structure: "V + 得 + Adj",
                explanation: "Dùng để đánh giá hoặc miêu tả kết quả, mức độ của hành động.",
                examples: [
                    { hanzi: "他说得很好。", pinyin: "Tā shuō de hěn hǎo.", vi: "Anh ấy nói rất tốt." },
                    { hanzi: "跑得很快。", pinyin: "Pǎo de hěn kuài.", vi: "Chạy rất nhanh." }
                ]
            },
            {
                title: "Động từ năng nguyện",
                structure: "會 / 能 / 可以 + V",
                explanation: "會 (biết qua học tập), 能 (khả năng tự thân), 可以 (cho phép).",
                examples: [
                    { hanzi: "我会说汉语。", pinyin: "Wǒ huì shuō Hànyǔ.", vi: "Tôi biết nói tiếng Trung." },
                    { hanzi: "你可以坐在这。", pinyin: "Nǐ kěyǐ zuò zài zhè.", vi: "Bạn có thể ngồi ở đây." }
                ]
            }
        ]
    },
    {
        level: 3,
        color: "#9C27B0",
        points: [
            {
                title: "Câu chữ 把 (Bǎ)",
                structure: "S + 把 + O + V + Thành phần khác",
                explanation: "Dùng để nhấn mạnh sự tác động của chủ ngữ làm thay đổi trạng thái của tân ngữ.",
                examples: [
                    { hanzi: "请把门关上。", pinyin: "Qǐng bǎ mén guān shàng.", vi: "Vui lòng đóng cửa vào." },
                    { hanzi: "我把作业做完了。", pinyin: "Wǒ bǎ zuòyè zuò wán le.", vi: "Tôi làm xong bài tập rồi." }
                ]
            },
            {
                title: "Câu bị động với 被 (Bèi)",
                structure: "O + 被 (+ S) + V + Thành phần khác",
                explanation: "Nhấn mạnh đối tượng bị tác động bởi một hành động nào đó (thường là kết quả không mong muốn).",
                examples: [
                    { hanzi: "自行车被哥哥骑走了。", pinyin: "Zìxíngchē bèi gēge qí zǒu le.", vi: "Xe đạp bị anh trai đi mất rồi." }
                ]
            },
            {
                title: "Bổ ngữ xu hướng phức hợp",
                structure: "V + (上/下/进/出/回/过/起) + 来/去",
                explanation: "Miêu tả chi tiết hướng của hành động đối với người nói.",
                examples: [
                    { hanzi: "老师走进了教室来。", pinyin: "Lǎoshī zǒu jìn le jiàoshì lái.", vi: "Thầy giáo đi vào lớp học (về phía người nói)." },
                    { hanzi: "拿出来。", pinyin: "Ná chū lái.", vi: "Lấy ra đây." }
                ]
            },
            {
                title: "Cấu trúc 越...越...",
                structure: "越 + A + 越 + B",
                explanation: "Biểu thị sự thay đổi của B tùy theo mức độ của A (Càng... càng...).",
                examples: [
                    { hanzi: "雨越下越大。", pinyin: "Yǔ yuè xià yuè dà.", vi: "Mưa càng lúc càng to." },
                    { hanzi: "汉字越学越有意思。", pinyin: "Hànzì yuè xué yuè yǒuyìsi.", vi: "Chữ Hán càng học càng thấy hay." }
                ]
            }
        ]
    },
    {
        level: 4,
        color: "#FF9800",
        points: [
            {
                title: "Cấu trúc 不仅...而且...",
                structure: "不仅...而且/还/也...",
                explanation: "Quan hệ tăng tiến: Không những... mà còn...",
                examples: [
                    { hanzi: "他不仅帅，而且很聪明。", pinyin: "Tā bùjǐn shuài, érqiě hěn cōngmíng.", vi: "Anh ấy không chỉ đẹp trai mà còn rất thông minh." }
                ]
            },
            {
                title: "Cấu trúc 无论...都...",
                structure: "无论 + Điều kiện + 都/也...",
                explanation: "Biểu thị kết quả không thay đổi dù trong bất kỳ điều kiện nào (Bất kể... đều...).",
                examples: [
                    { hanzi: "无论多忙，他都要运动。", pinyin: "Wúlùn duō máng, tā dōu yào yùndòng.", vi: "Bất kể bận thế nào, anh ấy đều phải vận động." }
                ]
            },
            {
                title: "Bổ ngữ khả năng",
                structure: "V + 得/不 + Kết quả/Xu hướng",
                explanation: "Biểu thị khả năng hành động có đạt được kết quả hay không.",
                examples: [
                    { hanzi: "我听不懂他在说什么。", pinyin: "Wǒ tīng bù dǒng tā zài shuō shénme.", vi: "Tôi nghe không hiểu anh ấy đang nói gì." },
                    { hanzi: "作业太多，我做不完。", pinyin: "Zuòyè tài duō, wǒ zuò bù wán.", vi: "Bài tập nhiều quá, tôi làm không xong." }
                ]
            },
            {
                title: "Cấu trúc 既然...就...",
                structure: "既然 + Nguyên nhân/Sự thực + 就...",
                explanation: "Dựa trên một sự thật đã biết để đưa ra kết luận hoặc kiến nghị (Đã... thì...).",
                examples: [
                    { hanzi: "既然天黑了，就回家吧。", pinyin: "Jìrán tiān hēi le, jiù huí jiā ba.", vi: "Đã trời tối rồi thì về nhà thôi." }
                ]
            },
            {
                title: "Phó từ 难道",
                structure: "难道...吗 / 难道...不成？",
                explanation: "Dùng trong câu phản vấn để nhấn mạnh sự khẳng định hoặc sự nghi ngờ.",
                examples: [
                    { hanzi: "难道你忘记了我们的约定吗？", pinyin: "Nándào nǐ wàngjì le wǒmen de yuēdìng ma?", vi: "Lẽ nào bạn đã quên hẹn ước của chúng ta rồi sao?" }
                ]
            }
        ]
    }
];
