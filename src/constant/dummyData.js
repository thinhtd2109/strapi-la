import * as _ from 'lodash';


const seafoodImages = [
    'https://canghaisan.com/wp-content/uploads/2018/07/hai-san-tuoi-song.jpg',
    'https://static.salekit.vn/image/shop/2/source/kinh-doanh-hai-san-tuoi-song3.jpg',
    'https://static.salekit.vn/image/shop/2/source/kinh-doanh-hai-san-tuoi-song4.jpg',
    'https://haitiengreenhotel.vn/wp-content/uploads/2018/11/huong-dan-chon-hai-san-tuoi-song-1.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8dfkGaHNnC2PAY0KLl5XW9HtYCkB6v4UXyiZiTDuYbCp7GlvBbVb0ozBcdbqOSKFkz48&usqp=CAU',
    'https://haitiengreenhotel.vn/wp-content/uploads/2018/11/huong-dan-chon-hai-san-tuoi-song-2.jpg',
    'https://file.hstatic.net/1000182631/file/tom-hum-xanh-tuoi-song_7b9e8a4f119d46bc9512714838127771_grande.png',
    'https://tuhaisan.vn/wp-content/uploads/2019/08/cua-hoang-de-alaska-tuoi-song.jpg',
];

const meatImages = [
    'https://img.vinanet.vn/zoom/640/Uploaded/ThuHai/NongSan/pork_JSGL.jpg',
    'https://thuongtruong.com.vn/DATA/IMAGES/2020/12/02/20201202085958361gia-thit-heo-hom-nay-212-thi-truong-tiep-tuc-lang--12-0.jpeg',
    'https://static2.yan.vn/YanNews/2167221/201912/trang-phuc-danh-rieng-cho-dai-gia-ao-in-hinh-thit-lon-c8414a70.jpg',
    'https://northwindvn.com/upload/images/cach-bao-quan-thit-bo-chuan-vi-cho-bua-com-ngon-cover-630.jpg',
    'https://cdn-www.vinid.net/efecb342-cach-chon-thit-ga-tuoi.jpg',
    'https://leep.imgix.net/2021/01/thi%CC%A3t-ga%CC%80-4.jpg?fm=pjpg&ixlib=php-1.2.1',
    'https://thucphamhuunghi.com/plugins/hinh-anh/san-pham/unnamed-400-400-q109.jpg',
    'https://suatangcobap.com/wp-content/uploads/2016/01/tam-quan-trong-cua-thit-bo.png',
    'https://bizweb.dktcdn.net/100/403/591/products/vun-lon.jpg?v=1602481888783'
];

const vegetableImages = [
    'https://vinmec-prod.s3.amazonaws.com/images/20190618_091243_113516_rau-cu-qua.max-800x800.png',
    'https://soyte.hanoi.gov.vn/documents/3672249/5344007/rau+cu+qua.jpg/14c8655b-4cc5-45d0-8ada-ac8c21a01940?t=1594223397404',
    'https://e.khoahoc.tv/photos/image/2014/03/20/fresh-vegetables.jpg',
    'https://cdn.tgdd.vn/Files/2019/11/26/1222471/7-cach-chon-rau-cu-qua-tuoi-ngon-cuc-don-gian-201911262113416739.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvYoSf6VbMfqkLjFBbyh8ioGDQe1NvRAQpSgzL-b1YnzLcC1RxmfEEOjBhZTnNxwiA2cg&usqp=CAU',
    'https://vnn-imgs-a1.vgcloud.vn/image.plo.vn/w800/uploaded/2020/tmuihk/2020_04_09/ca-chua_wbiq.jpg',
    'http://baogialai.com.vn/dataimages/201701/original/images2504657_rau.jpg',
    'https://cdn.tgdd.vn/2021/04/CookProduct/Zestaw-do-uprawy-ziol-Koszyk-ziolowy-z-doniczka-Cechy-charakterystyczne-proste-w-pielegnacji-1200x676.jpg',
];

const fruitImages = [
    'https://hoamaifood.com/wp-content/uploads/2019/12/anh-trai-cay-3-52846-zoom-1483016333261-28-0-663-1024-crop-1483016339827.jpg',
    'https://vnn-imgs-f.vgcloud.vn/2018/06/09/16/cach-don-gian-phan-biet-trai-cay-chua-hoa-chat-1.jpg',
    'https://nucuoimekong.com/wp-content/uploads/trai-cay-mien-tay-buoi-da-xanh.jpg',
    'https://agri.vn/wp-content/uploads/2021/01/nhung-loai-trai-cay-chi-co-o-viet-nam.jpg',
    'https://diadiembinhduong.vn/wp-content/uploads/2020/08/mang-cut.jpg',
    'https://bazantravel.com/cdn/medias/uploads/41/41572-trai-cay-dac-san-mien-tay-1-700x387.jpg',
    'https://hatgiongnangvang.com/wp-content/uploads/2018/04/hinh-anh-cach-lay-hat-dau-tay-lam-hat-giong-de-ot.jpg',
    'https://photo-cms-plo.zadn.vn/w800/Uploaded/2021/chuobun/2014_07_12/ootc20140711075805-rau-2.jpg'
];

const avatarImages = [
    'https://st.quantrimang.com/photos/image/2018/10/19/anh-hoa-dep-1.jpg',
    'https://hinhanhdep.vn/wp-content/uploads/2019/11/T%E1%BB%95ng-h%E1%BB%A3p-h%C3%ACnh-%E1%BA%A3nh-b%C3%ACnh-minh-s%E1%BB%9Bm-mai-%C4%91%E1%BA%B9p-nh%E1%BA%A5t-47.jpg',
    'https://studio.com.vn/wp-content/uploads/2021/05/anh-chan-dung.jpg',
    'http://i1.taimienphi.vn/tmp/cf/aut/hinh-anh-nguoi-mau.jpg',
    'https://i.vietgiaitri.com/2017/8/23/tin-moi-tin-trong-ngay-ngoi-sao-showbiz-sao-sao-chau-a-giai-tri-79322c.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTscJcQnI_ECU7_9Xl-T0Trc9Yl2xVl3wEUz3gtdtg_clfRKbUFgLnuYSOntUGwKQopvSk&usqp=CAU',
    'https://ttol.vietnamnetjsc.vn/images/2018/05/25/13/40/net-cuoi-be-gai-5-1527053440031984418330.jpg'
];

export const CatalogsProduct = [
    { id: 1, code: 'SEAFOOD', name: 'Hải sản' },
    { id: 2, code: 'MEAT', name: 'Thịt' },
    { id: 3, code: 'VEGETABLE', name: 'Rau/Củ' },
    { id: 4, code: 'FRUITS', name: 'Trái cây' },
];

export const StatusProduct = [
    { id: 1, code: 'NEW', name: 'Mới về' },
    { id: 2, code: 'HOT', name: 'Hot' },
    { id: 3, code: 'DISCOUNT', name: 'Khuyến mãi' },
    // { id: 4, code: 'ALL', name: 'Tất cả' },
];

export const Unit = [
    {
        id: 1,
        code: 'KILOGRAM',
        name: 'Kg',
    },
    {
        id: 2,
        code: 'PIECES',
        name: 'PCs',
    },   
];

export const Package = [
    { id:1, code: 'P1', name: '0.5 Kg' },
    { id:2, code: 'P2', name: '2 Kg' },
    { id:3, code: 'P3', name: '5 Kg'},
];

const PackageProduct = [
    { id:1, code: 'T1-1', classify: 'T1', name: '0.5 Kg', sale_price: '90000', retail_price: 120000 },
    { id:2, code: 'T1-2', classify: 'T1', name: '2 Kg', sale_price: '85000', retail_price: 110000 },
    { id:3, code: 'T1-3', classify: 'T1', name: '5 Kg', sale_price: '80000', retail_price: 100000 },
    { id:4, code: 'T2-1', classify: 'T2', name: '0.5 Kg', sale_price: '80000', retail_price: 100000 },
    { id:5, code: 'T2-2', classify: 'T2', name: '2 Kg', sale_price: '78000', retail_price: 95000 },
    { id:6, code: 'T2-3', classify: 'T2', name: '5 Kg', sale_price: '75000', retail_price: 90000 },
    { id:7, code: 'T3-1', classify: 'T3', name: '0.5 Kg', sale_price: '75000', retail_price: 850000 },
    { id:8, code: 'T3-2', classify: 'T3', name: '2 Kg', sale_price: '72000', retail_price: 82000 },
    { id:9, code: 'T3-3', classify: 'T3', name: '5 Kg', sale_price: '70000', retail_price: 80000 },
];

export const ClassifyProduct = [
    { id:1, code: 'T1', name: 'Loại 30 - 40 cm', package: [PackageProduct[0],PackageProduct[1],PackageProduct[2]] },
    { id:2, code: 'T2', name: 'Loại 15 - 30 cm', package: [PackageProduct[3],PackageProduct[4],PackageProduct[5]] },
    { id:3, code: 'T3', name: 'Loại 10 - 15 cm', package: [PackageProduct[6],PackageProduct[7],PackageProduct[8]] }
];

const Thumb = (index) => _.get({
    0: { id: 1, url: seafoodImages[_.random(7)], alt: 'Hải sản tươi ngon' },
    1: { id: 2, url: meatImages[_.random(8)], alt: 'Thịt nhập khẩu' },
    2: { id: 3, url: vegetableImages[_.random(7)], alt: 'Rau sạch nhà vườn' },
    3: { id: 4, url: fruitImages[_.random(7)], alt: 'Rau sạch nhà vườn' },
},`${index}`);

const NUMBER = _.random(3);

export const templateProduct = {
    id: 0,
    code: 'P2101234567',
    name: 'Hàu',
    description: 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.',
    catalog: CatalogsProduct[NUMBER],
    sale_price: '90000',
    retail_price: 120000,
    unit: Unit[0],
    image: Thumb(NUMBER),
    status: StatusProduct[0],
    classify: ClassifyProduct[_.random(2)],
};

export const products = _.map([...Array(150)], (e, key) => {
    const catalog = _.random(3);
    return (
        { 
            ...templateProduct, 
            id: key+1,
            name: _.random(10000, 50000),
            catalog: CatalogsProduct[catalog],
            unit: Unit[_.random(1)],
            image: Thumb(catalog),
            status: StatusProduct[_.random(2)]
        } 
    )
});

export const dataOverview = (timer) => _.get({
    'Y': { id: 1, data: {currency: 430400000, shopping: 4324,handbag: 323}},
    'M': { id: 2, data: {currency: 38700000, shopping: 367,handbag: 45}},
    'W': { id: 3, data: {currency: 9650000, shopping: 121,handbag: 78}},
},`${timer}`);

export const dataStatistical = (timer) => _.get({
    'Y': { 
            id: 1, 
            labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
            data: [32320000, 30030000, 20555000, 52224000, 10008700, 41234400, 50070000, 12305000, 11090000, 20220000, 40244000, 41340000]
         },
    'M': { 
            id: 2, 
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31' ],
            data: [2732000, 2503000, 4555500, 3222400, 2100000, 2523000, 4200000, 3230000, 2130000, 3020000, 3220000, 1300000, 2732000, 2503000, 4555500, 3222400, 2100000, 2523000, 4200000, 3230000, 2130000, 3020000, 3220000, 1300000, 2523000, 4200000, 3230000, 2130000, 3020000, 3220000, 1300000]
         },
    'W': { 
            id: 3, 
            labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'],
            data: [652000, 633000, 325500, 782400, 740000, 723000, 830000 ]
         },
},`${timer}`);

export const CURRENT_ORDER_STATUS = {
    code: "SUBMITTED",
    id: 2,
    name: "Xác nhận đơn hàng"
};

export const ORDER_STATUS = [
    {
        code: "AWAITING_PICKUP",
        id: 3,
        name: "Chờ lấy hàng"
    },
    {
        code: "CANCELLED",
        id: 6,
        name: "Đã huỷ"
    }
];

export const TEMPLATE_GROUP_ORDER_DETAIL = {
    "address": {
        "district": {
            "id": "3acdd742-4a54-4040-b9dc-2f8de49b7296",
            "name": "Gò Vấp"
        },
        "name": "Linh baby",
        "number": "50/3E",
        "phone": "0898988785",
        "province": {
            "id": "f7bf1e59-8d58-456b-8b5d-c4dd06b9815d",
            "name": "Hồ Chí Minh"
        },
        "street": {
            "id": "00fdfaa8-9966-4ffc-8734-b9081aa70385",
            "name": "Quang Trung"
        },
        "ward": {
            "id": "f65cdeb3-01c7-46eb-a49e-1f73b84dc159",
            "name": "Phường 8"
        }
    },
    "amount": 210000,
    "code": "O2100000082",
    "created": "2021-09-29T11:04:21+00:00",
    "delivery_price": 0,
    "delivery_time_unit": "DAY",
    "id": "e0ede305-d53f-4964-b4da-ccdc704dc4be",
    "order_items": [
        {
            "amount": 210000,
            "package": "Túi 1 kg",
            "price": 19000,
            "productByProduct": {
                "code": "P2100000075",
                "name": "Khoai tây",
                "photo": {
                    "name": "9A5A9058.JPG",
                    "url": "/photo/b78928da-c083-42bd-86f3-f8c16039b541/maxresdefault.jpg"
                },
                "vendorByVendor": {
                    "name": "PINNOW"
                }
            },
            "quantity": 15,
            "wholesale_price": 14000
        }
    ],
    order_status: {
        code: "SUBMITTED",
        id: 2,
        index: 4,
        name: "Xác nhận đơn hàng"
    },
    "paymentMethodByPaymentMethod": {
        "code": "CASH",
        "name": "Thanh toán tiền mặt"
    },
    "promotionComboByPromotionCombo": {
        "code": "FIRST_ORDER",
        "name": "3 kg Combo rau củ quả"
    },
    "total_amount": 210000,
    "voucher_amount": 0
};

const orders = [
    'a94e3e33-ee83-445d-984e-a1e1fd35735a',
    'bc1f4271-e557-457f-93d9-65fe59af33e4',
    '6abd87eb-900a-4cc9-bf17-18f105ef5e18',
    'f9e5dd3b-8459-427c-bdd2-4876578fc2f4'
];

export const ITEM_IN_GROUP_ORDER = {
    id: 'bc1f4271-e557-457f-93d9-65fe59af33e4',
    code: "O2100000083",
    account: {
        id: "328b8d64-f414-47bb-b71b-54bc8200fa24",
        full_name: "Linh baby",
        phone: "+84898988785",
    },
    avatar: avatarImages[_.random(6)],
    address: {
        phone: "0898988785",
        name: "Linh baby",
        number: "50/3E",
        street: {
            id: "00fdfaa8-9966-4ffc-8734-b9081aa70385",
            name: "Quang Trung",
        },
        ward: {
            id: "f65cdeb3-01c7-46eb-a49e-1f73b84dc159",
            name: "Phường 8",
        },
        district: {
            id: "3acdd742-4a54-4040-b9dc-2f8de49b7296",
            name: "Gò Vấp",
        },
        province: {
            id: "f7bf1e59-8d58-456b-8b5d-c4dd06b9815d",
            name: "Hồ Chí Minh",
        },
    },
    total_amount: 270000,
    order_status: {
        code: "CANCELLED",
        name: "Đã huỷ",
    },
    created: "2021-09-29T11:04:59+00:00",
    orders_aggregate: {
        aggregate: {
            count: 13,
        },
    },
};

export const LIST_ITEM_IN_GROUP_ORDER = _.map([...Array(_.random(3,5))], (e, key) => {
    return (
        { 
            ...ITEM_IN_GROUP_ORDER,
            key: key,
            avatar: avatarImages[_.random(3)],

        } 
    )
});
