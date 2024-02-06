import NavMenu from "@/components/NavMenu";

export default function LibraryLayout({ 
    children 
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <NavMenu />
            <div className="w-3/4">
                {children}
            </div>
        </>
    )
}