import {
  ShippingIcon,
  ReturnsIcon,
  SecurePaymentIcon,
  HeadsetIcon,
} from "@/assets/icons/home";

const featureData = [
  {
    icon: ShippingIcon,
    title: "Free Shipping",
    description: "On all qualifying orders across Rwanda",
    color: "bg-teal/10 text-teal",
  },
  {
    icon: ReturnsIcon,
    title: "Easy Returns",
    description: "Hassle-free returns within 30 days",
    color: "bg-blue/10 text-blue",
  },
  {
    icon: SecurePaymentIcon,
    title: "Secure Payments",
    description: "MTN MoMo, cards & cash on delivery",
    color: "bg-green/10 text-green",
  },
  {
    icon: HeadsetIcon,
    title: "Dedicated Support",
    description: "Expert help whenever you need it",
    color: "bg-yellow/30 text-dark",
  },
];

const FooterFeature = () => {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 sm:px-8 xl:px-0">
        <div className="overflow-hidden rounded-2xl border border-gray-3 bg-gradient-to-r from-gray-1 via-white to-gray-1">
          <div className="grid grid-cols-1 divide-y divide-gray-3 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {featureData.map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="group flex items-center gap-4 px-6 py-6 transition hover:bg-white sm:px-8"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition duration-300 group-hover:scale-110 ${color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-dark sm:text-base">{title}</h3>
                  <p className="mt-0.5 text-xs text-dark-3 sm:text-sm">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FooterFeature;
