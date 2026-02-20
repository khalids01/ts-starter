import { Link } from "@tanstack/react-router";

export default function Logo() {
    return (
        <Link to="/">
            <div className="flex items-center gap-2">
                <span className="text-lg font-bold">Logo</span>
            </div>
        </Link>
    )
}