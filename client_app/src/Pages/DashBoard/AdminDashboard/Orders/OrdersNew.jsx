import axios from "axios";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { formatPrice } from "../../../../utils/formatPrice";
import Table, { StatusPill } from '../../../../components/DataTables/Table';
import toast from "react-hot-toast";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import { Package, Eye, ChevronDown } from 'lucide-react';

const ProductManagement = () => {
  const [orders, setOrders] = useState([]);
  const { axiosSecure } = useAxiosSecure();
  const [activeTab, setActiveTab] = useState("pending");

  // Get all orders
  const getAllOrders = async () => {
    try {
      const res = await axiosSecure.get("/admin/orders");
      setOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAllOrders();
  }, []);

  // Filter orders with status "pending" or "processing"
  const pendingOrders = orders.filter(
    (order) => order.status === "pending" || order.status === "processing"
  );

  const tableColumns = [
    {
      Header: '#',
      accessor: '',
      Cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.index + 1}</span>
      )
    },
    {
      Header: 'First Name',
      accessor: 'billingData.firstName',
      Cell: ({ value }) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      Header: 'Last Name',
      accessor: 'billingData.lastName',
      Cell: ({ value }) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      Header: 'Email',
      accessor: 'email',
      Cell: ({ value }) => (
        <span className="text-gray-600">{value}</span>
      )
    },
    {
      Header: 'Date Created',
      accessor: 'date',
      Cell: ({ value }) => (
        <span className="text-gray-600">{value}</span>
      )
    },
    {
      Header: 'Total',
      accessor: 'totalPrice',
      Cell: ({ value }) => (
        <span className="font-medium text-base">{formatPrice(value)}</span>
      )
    },
    {
      Header: 'Quantity',
      accessor: 'quantity',
      Cell: ({ value }) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      Header: 'Type',
      accessor: '',
      Cell: ({ row }) => {
        const data = row.original;
        const status = data.billingData.paymentDetails || data.payment_prof ? 'Online Payment' : 'Cash on Delivery';
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-base/10 text-base">
            {status}
          </span>
        );
      }
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: StatusPill,
    },
    {
      Header: 'Action',
      accessor: '',
      Cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link to={`/dashboard/orders_new/${order._id}`}>
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg 
                border border-gray-200 hover:bg-gray-50 transition-colors">
                <Eye size={16} className="text-gray-500" />
                View
              </button>
            </Link>

            <select
              className={`
                appearance-none cursor-pointer rounded-lg border px-3 py-2 pr-8 text-sm font-medium
                transition-colors focus:outline-none focus:ring-2 focus:ring-base/20
                ${order.status === "cancelled" ? "bg-red-50 text-red-900 border-red-200" : ""}
                ${order.status === "delivered" ? "bg-green-50 text-green-900 border-green-200" : ""}
                ${!["cancelled", "delivered"].includes(order.status) ? "bg-white text-gray-900 border-gray-200" : ""}
              `}
              disabled={order.status === "cancelled" || order.status === "delivered"}
              value={order.status}
              onChange={(e) => handleStatusChange(order._id, e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        );
      }
    },
  ];

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axiosSecure.put(`/admin/orders/${orderId}/status`, {
        status: newStatus,
      });
      if (res.data.modifiedCount > 0) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order,
          ),
        );
        toast.success("Order status updated successfully");
      } else {
        toast.error("Failed to update order status");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Failed to update order status");
    }
  };

  const orderTabs = [
    { status: "pending", label: "Pending" },
    { status: "processing", label: "Processing" },
    { status: "delivered", label: "Delivered" },
    { status: "cancelled", label: "Cancelled" },
  ];

  const filteredData = orders.filter((order) => order.status === activeTab);

  return (
    <div className="p-6 space-y-6">
      <Helmet>
        <title>Manage Orders - EFurnish</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-base/5 rounded-xl">
            <Package className="w-6 h-6 text-base" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500">Manage and track all orders</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <span className="px-4 py-2 text-sm text-gray-600 border-r border-gray-200">
            Total Orders:
          </span>
          <span className="px-4 py-2 text-sm font-medium text-base">
            {filteredData.length}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="flex gap-1 p-2 border-b border-gray-200">
          {orderTabs.map((tab) => (
            <button
              key={tab.status}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
                ${activeTab === tab.status
                  ? "bg-base text-white"
                  : "text-gray-600 hover:bg-gray-50"
                }`}
              onClick={() => setActiveTab(tab.status)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="p-4">
          <Table
            columns={tableColumns}
            data={filteredData}
            className="rounded-lg border border-gray-200"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
