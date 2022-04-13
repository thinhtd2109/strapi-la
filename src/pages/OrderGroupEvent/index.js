import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Row,
  Typography,
  Table,
  Spin,
  Space,
  notification,
  Input,
  Tag,
} from "antd";
import {
  PlusOutlined,
  FormOutlined,
  DeleteOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import style from "./style.module.scss";
import _ from "lodash";
import moment from "moment";
import PaginationComponent from "../../components/PaginationComponent";
import { useHistory } from "react-router";
import slugs from "../../constant/slugs";
import DeleteModal from "../../components/Modal/DeleteModal";
import { PAGE_INDEX, PAGE_SIZE } from "../../constant/info";
import {
  useDeleteOrderGroupEvent,
  useGetListEventOrderGroup,
  usePauseEvent,
} from "./hooks";
import { GET_LIST_ORDER_GROUP_EVENT } from "../../graphql/schemas/ordergroupevent/query";
import { formatMoney } from "../../helpers/index";
import WarningModal from "../../components/Modal/WarningModal";
import { useDebounce } from "use-debounce";
import { SearchOutlined } from "@ant-design/icons";
import clsx from "clsx";

const OrderGroupEvent = () => {
  const history = useHistory();
  const [pageIndex, setPageIndex] = useState(PAGE_INDEX);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [skip, setSkip] = useState(0);
  const [isDelete, setIsDelete] = useState(false);
  const [idDelete, setIdDelete] = useState(null);
  const [eventId, setEventId] = useState(null);
  const [searchText, setSearchText] = useState("");

  const [value] = useDebounce(searchText, 1000);

  const [pauseModalOpen, setPauseModalOpen] = useState(false);

  const pauseEventGroup = usePauseEvent();

  const pauseEvent = () => {
    if (!_.isEmpty(eventId)) {
      pauseEventGroup({
        variables: {
          id: eventId,
        },
      }).then(
        () => {
          refetch();
          setEventId(null);
          setPauseModalOpen(false);
          notification["success"]({
            message: "Kết thúc chương trình",
            description: "Kết thúc chương trình thành công.",
          });
        },
        (error) => {
          notification["error"]({
            message: "Kết thúc chương trình",
            description:
              _.get(error, "message") || "Kết thúc chương trình thành công.",
          });
        }
      );
    }
  };

  const { data, total, loading, refetch } = useGetListEventOrderGroup({
    skip,
    take: pageSize,
    where: {
      deleted: { _eq: false },
      _or: [
        {
          code: {
            _ilike: `%${value}%`,
          },
        },
      ],
    },
  });

  const deleteOrderGroupEvent = useDeleteOrderGroupEvent();

  const handleDelete = () => {
    deleteOrderGroupEvent({
      variables: {
        id: idDelete,
      },
    })
      .then(() => {
        notification["success"]({
          message: "Xóa chương trình",
          description: "Xóa chương trình thành công.",
        });
        refetch();
        setIdDelete(null);
        setIsDelete(false);
      })
      .catch((err) => {
        notification["error"]({
          message: "Xóa chương trình",
          description: "Xóa chương trình thất bại",
        });
      });
  };
  const compareTime = (record) => {
    let now = moment(new Date(), "YYYY-MM-DD HH:mm").subtract(7, "hours");
    let startTime = moment(_.get(record, "start_time"), "YYYY-MM-DD HH:mm");
    let endTime = moment(_.get(record, "end_time"), "YYYY-MM-DD HH:mm");
    if (now.isBefore(startTime)) {
      return <Tag className={clsx(style.tag, style.waitingStatus)} onClick={() => history.push('/flash-sale/detail/' + record.id)}>Đang chờ</Tag>
    }

    if (now.isBetween(startTime, endTime)) {
      return <Tag className={clsx(style.tag, style.runningStatus)} onClick={() => history.push('/flash-sale/detail/' + record.id)}>Đang chạy</Tag>
    }

    if (now.isAfter(endTime)) {
      return <Tag className={clsx(style.tag, style.endStatus)} onClick={() => history.push('/flash-sale/detail/' + record.id)}>Kết thúc</Tag>
    }
  };

  const columns = [
    {
      key: "id",
      title: "STT",
      width: 120,
      ellipsis: true,
      render: (text, record, index) => {
        return (
          <span className="item-center">
            {(pageIndex - 1) * pageSize + index + 1}
          </span>
        );
      },
    },
    {
      key: "status",
      ellipsis: true,
      width: 200,
      title: "Trạng thái",
      dataIndex: "status",
      render: (text, record, index) => {
        return compareTime(record);
      },
    },
    {
      key: "code",
      ellipsis: true,
      title: "Mã sự kiện",
      width: 200,
      render: (text, record) => {
        return (
          <Link
            to={`/order-group-event/detail/${_.get(record, "id")}`}
            style={{ cursor: "pointer" }}
          >
            {_.get(record, "code", "-") || "-"}
          </Link>
        );
      },
    },
    //TODO
    {
      key: "order_min_price",
      title: "Giá trị đơn tối thiểu",
      width: 300,
      ellipsis: true,
      dataIndex: "order_min_price",
      render: (text) => formatMoney(Number(text)) + " đ",
    },
    {
      key: "goal",
      title: "Mục tiêu",
      width: 200,
      ellipsis: true,
      render: (text, record) => {
        if (record.total_participates) {
          return formatMoney(Number(record.total_participates));
        }
        if (record.total_order_min_price) {
          return formatMoney(Number(record.total_order_min_price));
        }
        if (record.total_order_number) {
          return formatMoney(Number(record.total_order_number));
        }
      },
    },
    {
      key: "time_next_group",
      width: 260,
      ellipsis: true,
      title: "Tần suất tạo đơn",
      dataIndex: "time_next_group",
    },
    {
      key: "group_timeline",
      ellipsis: true,
      width: 260,
      title: "Thời gian hết hạn",
      dataIndex: "group_timeline",
    },
    {
      key: "start_time",
      title: "Thời gian bắt đầu",
      ellipsis: true,
      width: 260,
      dataIndex: "start_time",
      render: (text, record) => {
        return moment(text).format("DD/MM/YYYY HH:mm");
      },
    },
    {
      key: "end_time",
      ellipsis: true,
      width: 260,
      title: "Thời gian kết thúc",
      dataIndex: "end_time",
      render: (text, record) => {
        return moment(text).format("DD/MM/YYYY HH:mm");
      },
    },
    {
      key: "action",
      title: "-",
      ellipsis: true,
      dataIndex: "action",
      render: (_, record) => {
        let now = moment(new Date(), "YYYY-MM-DD HH:mm").subtract(7, "hours");
        let startTime = moment(record?.start_time, "YYYY-MM-DD HH:mm");
        let endTime = moment(record?.end_time, "YYYY-MM-DD HH:mm");
        if (now.isAfter(endTime)) {
          return <div>-</div>;
        }
        if (now.isBetween(startTime, endTime)) {
          return (
            <Space size="middle" style={{ cursor: "pointer" }}>
              <PauseCircleOutlined
                onClick={() => {
                  setEventId(record?.id);
                  setPauseModalOpen(true);
                }}
                style={{ color: "#748cad" }}
              />
              <FormOutlined
                style={{ color: "#748cad" }}
                onClick={() =>
                  history.push("/order-group-event/edit/" + record.id)
                }
              />
            </Space>
          );
        }
        return (
          <Space size="middle" style={{ cursor: "pointer" }}>
            <FormOutlined
              onClick={() =>
                history.push("/order-group-event/edit/" + record.id)
              }
              style={{ color: "#748cad" }}
            />
            <DeleteOutlined
              style={{ color: "#EF4036" }}
              onClick={() => {
                setIsDelete(true);
                setIdDelete(record.id);
              }}
            />
          </Space>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="wapperLoading">
        <Spin tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className={style.orderGroupPage}>
      <WarningModal
        dataId={eventId}
        visible={pauseModalOpen}
        onBack={() => setPauseModalOpen(false)}
        onSubmit={pauseEvent}
        title="Thông báo"
        content={
          <span>
            Bạn có muốn <span style={{ fontWeight: "bold" }}>Kết thúc</span> sự
            kiện?
          </span>
        }
      />
      <WarningModal
        title="Xóa chương trình"
        content={
          <span>
            Bạn có muốn <span style={{ fontWeight: "bold" }}>xóa</span> sự kiện?
          </span>
        }
        visible={isDelete}
        onBack={() => setIsDelete(false)}
        onSubmit={handleDelete}
      />

      <Row justify="space-between" className={style.titleRow}>
        <Typography.Title level={3}>Danh sách sự kiện</Typography.Title>
        <Button
          className={style.stylePrimary}
          icon={<PlusOutlined />}
          onClick={() => history.push(slugs.orderGroupEventCreate)}
        >
          Tạo sự kiện mua chung
        </Button>
      </Row>
      <div className={style.bg}>
        <Row justify="end">
          <Input
            prefix={<SearchOutlined className="site-form-item-icon" />}
            placeholder="Tìm kiếm"
            style={{ width: "26%", height: 38 }}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setSkip(0);
              setPageIndex(1);
            }}
          />
        </Row>
        <Row className={style.wrapperTable}>
          <Table
            dataSource={data}
            rowKey="id"
            columns={columns}
            pagination={false}
            loading={loading}
          />
        </Row>

        <PaginationComponent
          total={total}
          pageSize={pageSize}
          pageIndex={pageIndex}
          pageSizeOptions={[10, 20, 40, 80, 120]}
          setPageSize={setPageSize}
          setPageIndex={(index) => {
            setPageIndex(index);
            setSkip(index * pageSize - pageSize);
          }}
          pagename="ORDER_GROUP_EVENT"
        />
      </div>
    </div>
  );
};

export default OrderGroupEvent;
